import type { Question } from '~/data/questions'

/**
 * 採点ロジック（Nuxt/Vue に依存しない純粋な TypeScript）
 *
 * 方針:
 *  - SELECT 系 : 模範解答を同じDBで実行した「結果」とユーザーの結果を比較する
 *  - DDL/DML系 : 模範解答を実行した後の「DBの状態」とユーザー実行後の状態を比較する
 *  - 構文指定  : コメント・文字列・空白の揺れを正規化したうえで判定する
 *  - すべてサンドボックス（DBのコピー）上で実行し、基準DBは変更しない
 */

export type SqlValue  = string | number | null
export type SqlResult = { columns: string[]; values: SqlValue[][] }[]
export type QueryFn   = (sql: string) => SqlResult

/** 使い捨てのDBコピーを作り、fn 実行後に必ず破棄する関数 */
export type WithSandbox = <T>(fn: (run: QueryFn) => T) => T

export type VerdictStatus = 'correct' | 'wrong' | 'missing'

export interface Verdict {
  status:  VerdictStatus
  /** 使われていない指定構文のラベル（status = 'missing' のとき） */
  missing: string[]
  /** 不正解の理由（status = 'wrong' のとき。模範解答の中身は含めない） */
  reason:  string
}

/* ───────────────────────── 構文指定チェック ───────────────────────── */

/**
 * キーワード判定用に SQL を正規化する。
 *  - コメント(-- / ブロックコメント)を除去し、文字列リテラルは '' に置換（中身でのすり抜けを防ぐ）
 *  - 大文字化・連続空白(改行含む)を1つに・括弧内側の空白を除去
 *  - LEFT OUTER JOIN → LEFT JOIN
 */
export function normalizeSqlForKeywords(sql: string): string {
  return sql
    .replace(/'(?:[^']|'')*'|--[^\n]*|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("'") ? "''" : ' '))
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .replace(/\bLEFT OUTER JOIN\b/g, 'LEFT JOIN')
    .trim()
}

/** 正規化済みSQLに keyword が（語の境界を考慮して）含まれるか */
function hasKeyword(normalizedSql: string, keyword: string): boolean {
  const kw = keyword.toUpperCase().replace(/\s+/g, ' ').replace(/\( /g, '(')
  const body = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const head = /^[A-Z0-9_]/.test(kw) ? '(?<![A-Z0-9_])' : ''
  const tail = /[A-Z0-9_]$/.test(kw) ? '(?![A-Z0-9_])' : ''
  return new RegExp(head + body + tail).test(normalizedSql)
}

/** 指定構文のうち、使われていないもののラベルを返す */
export function findMissingKeywords(q: Question, sql: string): string[] {
  const norm = normalizeSqlForKeywords(sql)
  return (q.requiredKeywords ?? [])
    .filter((k) => ![k.keyword, ...(k.alt ?? [])].some((kw) => hasKeyword(norm, kw)))
    .map((k) => k.label)
}

/* ───────────────────────── SELECT 結果の比較 ───────────────────────── */

const normCell = (v: SqlValue): string =>
  v === null ? 'null' : typeof v === 'number' ? `n:${Math.round(v * 1e6) / 1e6}` : `s:${v}`

const rowKey = (row: SqlValue[]): string => JSON.stringify(row.map(normCell))

const sortedKeys = (rows: SqlValue[][]): string[] => rows.map(rowKey).sort()

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function compareCell(a: SqlValue, b: SqlValue): number {
  if (a === b) return 0
  if (a === null) return -1
  if (b === null) return 1
  return a < b ? -1 : 1
}

/**
 * SELECT の結果比較。一致なら null、不一致なら理由を返す。
 *  - 模範解答の列がすべて含まれていること（列名・別名は大文字小文字を区別しない）
 *  - 追加の列は許容（SELECT * など）。模範解答の列だけを取り出して比較する
 *  - 行は順不同で比較。order 指定があれば、その列が指定どおり並んでいることも確認
 *  - 数値は小数第6位で丸めて比較（AVG などの浮動小数点誤差を吸収）
 */
export function compareSelect(
  expected: SqlResult,
  actual:   SqlResult,
  order?:   Question['order'],
): string | null {
  const exp = expected[0]
  const act = actual[0]

  if (!exp) {
    return !act || act.values.length === 0 ? null : '取得される行数が異なります。条件を見直してください。'
  }
  if (!act) return '結果が0行です。条件や結合を見直してください（SELECT 文で取得できているかも確認してください）。'

  const actCols = act.columns.map((c) => c.toLowerCase())
  const idx = exp.columns.map((c) => actCols.indexOf(c.toLowerCase()))
  const notFound = exp.columns.filter((_, i) => idx[i] < 0)
  if (notFound.length > 0) {
    return `列が見つかりません: ${notFound.join(', ')}（列名・別名を確認してください）`
  }

  if (act.values.length !== exp.values.length) {
    return '行数が異なります。条件・結合・重複の扱いを見直してください。'
  }

  const projected = act.values.map((r) => idx.map((i) => r[i]))
  if (!sameList(sortedKeys(projected), sortedKeys(exp.values))) {
    return '取得した値が異なる行があります。計算式や条件を見直してください。'
  }

  if (order) {
    // 複数列の並び順にも対応（先頭の列から順に、値が異なった最初の列で大小を判定する）
    const specs = (Array.isArray(order) ? order : [order])
      .map((o) => ({
        col:  exp.columns.findIndex((c) => c.toLowerCase() === o.column.toLowerCase()),
        sign: o.dir === 'asc' ? 1 : -1,
        text: `${o.column} を${o.dir === 'asc' ? '昇順' : '降順'}`,
      }))
      .filter((s) => s.col >= 0)

    for (let i = 0; i < projected.length - 1; i++) {
      for (const s of specs) {
        const cmp = compareCell(projected[i][s.col], projected[i + 1][s.col]) * s.sign
        if (cmp > 0) return `並び順が指定と異なります（${specs.map((x) => x.text).join('、次に ')}）。`
        if (cmp < 0) break   // この列で順序が確定したので、次の列は見ない
      }
    }
  }
  return null
}

/* ───────────────────────── DDL/DML: DB状態の比較 ───────────────────────── */

export interface DbSignature {
  /** テーブル・ビュー・インデックスの構造 */
  schema: string
  /** 全テーブル・ビューの行データ */
  data:   string
}

const quoteIdent = (name: string): string => `"${name.replace(/"/g, '""')}"`

/**
 * DBの「構造」と「データ」を比較可能な文字列にまとめる。
 *  構造: 列名・型・NOT NULL・PK・外部キー・インデックス・ビューの列
 *  データ: 各テーブル/ビューの全行（順不同で比較できるようソート済み）
 */
export function dbSignature(run: QueryFn): DbSignature {
  const rows = (sql: string): SqlValue[][] => run(sql)[0]?.values ?? []
  const lower = (v: SqlValue) => String(v ?? '').toLowerCase()

  const objects = rows(
    `SELECT type, name, tbl_name FROM sqlite_master
     WHERE name NOT LIKE 'sqlite\\_%' ESCAPE '\\' ORDER BY type, name`,
  )

  const schema: Record<string, unknown> = {}
  const data:   Record<string, string[]> = {}

  for (const [type, rawName, rawTbl] of objects) {
    const name = String(rawName)
    const key  = `${type}:${name.toLowerCase()}`

    if (type === 'table' || type === 'view') {
      // table_info: [cid, name, type, notnull, dflt_value, pk]
      const cols = rows(`PRAGMA table_info(${quoteIdent(name)})`).map((r) => [
        lower(r[1]), String(r[2] ?? '').toUpperCase(), Number(r[3]),
        String(r[4] ?? '').replace(/\s+/g, ''), Number(r[5]),
      ])
      // foreign_key_list: [id, seq, table, from, to, ...]
      const fks = type === 'table'
        ? rows(`PRAGMA foreign_key_list(${quoteIdent(name)})`)
            .map((r) => `${lower(r[3])}->${lower(r[2])}`).sort()
        : []
      // UNIQUE 制約（index_list の origin = 'u'）。構成列を並べた文字列で表す
      const uniques = type === 'table'
        ? rows(`PRAGMA index_list(${quoteIdent(name)})`)
            .filter((r) => r[3] === 'u')
            .map((r) => rows(`PRAGMA index_info(${quoteIdent(String(r[1]))})`).map((c) => lower(c[2])).join(','))
            .sort()
        : []
      schema[key] = { cols, fks, uniques }
      data[key]   = sortedKeys(rows(`SELECT * FROM ${quoteIdent(name)}`))
    } else if (type === 'index') {
      const tbl = String(rawTbl)
      // index_info: [seqno, cid, name]
      const cols = rows(`PRAGMA index_info(${quoteIdent(name)})`).map((r) => lower(r[2]))
      // index_list: [seq, name, unique, origin, partial]
      const unique = rows(`PRAGMA index_list(${quoteIdent(tbl)})`)
        .find((r) => lower(r[1]) === name.toLowerCase())?.[2] ?? 0
      schema[key] = { table: tbl.toLowerCase(), cols, unique: Number(unique) }
    } else {
      schema[key] = { table: lower(rawTbl) }
    }
  }

  return { schema: JSON.stringify(schema), data: JSON.stringify(data) }
}

/** 状態の比較。一致なら null、不一致なら理由を返す */
export function compareSignature(expected: DbSignature, actual: DbSignature): string | null {
  if (expected.schema !== actual.schema) {
    return 'テーブル・ビュー・インデックスの構造が期待と異なります（名前・列・型・制約を確認してください）。'
  }
  if (expected.data !== actual.data) {
    return 'データの内容が期待と異なります（更新・削除・追加の対象や条件を確認してください）。'
  }
  return null
}

/* ───────────────────────── 実行 + 採点 ───────────────────────── */

const isStateQuestion = (q: Question) => q.category === 'DDL' || q.category === 'DML'

/**
 * probes（制約の動作確認）を実行し、期待と食い違ったものの label を返す。
 * 各 probe は SAVEPOINT 内で実行して必ず巻き戻すので、互いに影響しない。
 */
function runProbes(q: Question, run: QueryFn): string[] {
  const failures: string[] = []
  for (const p of q.probes ?? []) {
    run('SAVEPOINT probe')
    let failed = false
    try { run(p.sql) } catch { failed = true }
    try { run('ROLLBACK TO probe; RELEASE probe') } catch { /* 巻き戻し不要な状態 */ }
    if (failed !== p.fails) failures.push(p.label)
  }
  return failures
}

/**
 * ユーザーのSQLをサンドボックスで実行し、必要なら採点する。
 * SQL のエラーは例外としてそのまま投げる（呼び出し側で表示する）。
 */
export function runAndJudge(
  q:           Question,
  sql:         string,
  withSandbox: WithSandbox,
  doJudge:     boolean,
): { result: SqlResult; verdict: Verdict | null } {
  let userSignature: DbSignature | undefined
  let probeFailures: string[] = []

  // ユーザーSQLの実行（DDL/DMLは実行後の状態・制約の動作も同じサンドボックスから取得）
  const result = withSandbox((run) => {
    const res = run(sql)
    if (doJudge && isStateQuestion(q)) {
      userSignature = dbSignature(run)
      probeFailures = runProbes(q, run)   // 構造の取得後に実行する（プローブはDBを汚さないが念のため）
    }
    return res
  })
  if (!doJudge) return { result, verdict: null }

  // 模範解答を別のサンドボックスで実行して期待値を得る
  let reason = isStateQuestion(q)
    ? compareSignature(withSandbox((run) => { run(q.answer); return dbSignature(run) }), userSignature!)
    : compareSelect(withSandbox((run) => run(q.answer)), result, q.order)

  // 構造・データが一致していても、制約の実際の動作が違えば不正解（CHECK など構造から読めないもの）
  if (reason === null && probeFailures.length > 0) {
    reason = `制約の動作が期待と異なります: ${probeFailures.join(' / ')}`
  }

  if (reason !== null) return { result, verdict: { status: 'wrong', missing: [], reason } }

  const missing = findMissingKeywords(q, sql)
  if (missing.length > 0) return { result, verdict: { status: 'missing', missing, reason: '' } }

  return { result, verdict: { status: 'correct', missing: [], reason: '' } }
}
