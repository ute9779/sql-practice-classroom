import type { SqlValue, QueryFn } from '~/utils/judge'

/**
 * SQL 実行前後のDBの中身を比べて、「何が変わったか」を画面に出せる形にまとめる。
 * Nuxt/Vue に依存しない純粋な TypeScript（採点ロジック utils/judge.ts とは独立）。
 */

/** 1つのテーブルについて画面に出す行数の上限 */
export const MAX_DISPLAY_ROWS = 30

/* ───────────────────────── DBの中身の取得 ───────────────────────── */

interface DumpColumn { name: string; type: string; pk: number }
interface DumpTable  { name: string; kind: 'table' | 'view'; columns: DumpColumn[]; rows: SqlValue[][] }
interface DumpIndex  { name: string; table: string; columns: string[] }

export interface DbDump {
  /** キーは小文字の名前 */
  tables:  Record<string, DumpTable>
  indexes: Record<string, DumpIndex>
}

const quoteIdent = (name: string): string => `"${name.replace(/"/g, '""')}"`

/** テーブル・ビュー・インデックスの構造と全行を取得する */
export function dumpDb(run: QueryFn): DbDump {
  const rows = (sql: string): SqlValue[][] => run(sql)[0]?.values ?? []
  const dump: DbDump = { tables: {}, indexes: {} }

  const objects = rows(
    `SELECT type, name, tbl_name FROM sqlite_master
     WHERE name NOT LIKE 'sqlite\\_%' ESCAPE '\\' ORDER BY type, name`,
  )

  for (const [type, rawName, rawTbl] of objects) {
    const name = String(rawName)
    const key  = name.toLowerCase()

    if (type === 'table' || type === 'view') {
      // table_info: [cid, name, type, notnull, dflt_value, pk]
      const columns = rows(`PRAGMA table_info(${quoteIdent(name)})`).map((r) => ({
        name: String(r[1]), type: String(r[2] ?? ''), pk: Number(r[5]),
      }))
      dump.tables[key] = { name, kind: type, columns, rows: rows(`SELECT * FROM ${quoteIdent(name)}`) }
    } else if (type === 'index') {
      // index_info: [seqno, cid, name]
      const columns = rows(`PRAGMA index_info(${quoteIdent(name)})`).map((r) => String(r[2]))
      dump.indexes[key] = { name, table: String(rawTbl), columns }
    }
  }
  return dump
}

/**
 * この接続でこれまでに INSERT/UPDATE/DELETE された行の累計。
 * 実行の前後で引き算すると、「そのSQLが影響した行数」になる。
 */
export function totalChanges(run: QueryFn): number {
  return Number(run('SELECT total_changes()')[0]?.values[0]?.[0] ?? 0)
}

/* ───────────────────────── 差分の表現 ───────────────────────── */

/** + は追加（または更新後）、- は削除（または更新前）、空白は変更なし */
export type DiffMark = '+' | '-' | ' '

export interface DiffRow {
  mark:        DiffMark
  values:      SqlValue[]
  /** 更新後の行(+)で、更新前から値が変わった列の位置 */
  changedCols: number[]
}

export interface TableChange {
  type:    'table'
  kind:    'table' | 'view'
  name:    string
  change:  'created' | 'dropped' | 'altered' | 'data'
  columns: string[]
  addedColumns:   string[]
  removedColumns: string[]
  /** 主キーの列の位置（columns の添字） */
  pkCols:         number[]
  /** 表示する行（上限 MAX_DISPLAY_ROWS） */
  rows:      DiffRow[]
  /** 変更がなかった行数（data のとき） */
  unchanged: number
  /** 上限を超えて表示を省略した行数 */
  omitted:   number
}

export interface IndexChange {
  type:    'index'
  name:    string
  table:   string
  columns: string[]
  change:  'created' | 'dropped'
}

export type ObjectChange = TableChange | IndexChange

export interface DbChanges {
  /** そのSQLが影響した行数（INSERT/UPDATE/DELETE の合計） */
  affectedRows: number
  items:        ObjectChange[]
}

/* ───────────────────────── 差分の計算 ───────────────────────── */

const sameRow = (a: SqlValue[], b: SqlValue[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

const rowKey = (r: SqlValue[]): string => JSON.stringify(r)

function limit(rows: DiffRow[]): { shown: DiffRow[]; omitted: number } {
  return { shown: rows.slice(0, MAX_DISPLAY_ROWS), omitted: Math.max(0, rows.length - MAX_DISPLAY_ROWS) }
}

/**
 * 同じ列構成のテーブルの行の差分。
 *  - 主キーがあれば、主キーで前後の行を対応づける（UPDATE は「更新前→更新後」が並び、変わった列が分かる）
 *  - なければ、行の内容の一致で比べる（追加と削除だけになる）
 */
function diffRows(
  columns: DumpColumn[], before: SqlValue[][], after: SqlValue[][],
): { rows: DiffRow[]; unchanged: number } {
  const out: DiffRow[] = []
  let unchanged = 0

  const pkIdx = columns
    .map((c, i) => ({ i, pk: c.pk }))
    .filter((c) => c.pk > 0)
    .sort((a, b) => a.pk - b.pk)
    .map((c) => c.i)

  if (pkIdx.length > 0) {
    const keyOf = (r: SqlValue[]) => JSON.stringify(pkIdx.map((i) => r[i]))
    const afterMap  = new Map(after.map((r) => [keyOf(r), r]))
    const beforeMap = new Map(before.map((r) => [keyOf(r), r]))

    for (const r of before) {
      const n = afterMap.get(keyOf(r))
      if (!n) {
        out.push({ mark: '-', values: r, changedCols: [] })
      } else if (!sameRow(r, n)) {
        out.push({ mark: '-', values: r, changedCols: [] })
        out.push({ mark: '+', values: n, changedCols: n.map((v, i) => (v === r[i] ? -1 : i)).filter((i) => i >= 0) })
      } else {
        unchanged++
      }
    }
    for (const r of after) {
      if (!beforeMap.has(keyOf(r))) out.push({ mark: '+', values: r, changedCols: [] })
    }
    return { rows: out, unchanged }
  }

  // 主キーなし: 内容が一致する行同士を打ち消し合う
  const remain = new Map<string, number>()
  for (const r of before) remain.set(rowKey(r), (remain.get(rowKey(r)) ?? 0) + 1)

  const added: SqlValue[][] = []
  for (const r of after) {
    const k = rowKey(r)
    if ((remain.get(k) ?? 0) > 0) { remain.set(k, remain.get(k)! - 1); unchanged++ } else added.push(r)
  }
  for (const r of before) {
    const k = rowKey(r)
    if ((remain.get(k) ?? 0) > 0) { remain.set(k, remain.get(k)! - 1); out.push({ mark: '-', values: r, changedCols: [] }) }
  }
  for (const r of added) out.push({ mark: '+', values: r, changedCols: [] })
  return { rows: out, unchanged }
}

const colKey = (c: DumpColumn) => `${c.name.toLowerCase()}:${c.type.toUpperCase()}`

/** 実行前後のDBを比べて、変更点をまとめる */
export function diffDb(before: DbDump, after: DbDump, affectedRows: number): DbChanges {
  const items: ObjectChange[] = []

  const tableItem = (
    t: DumpTable, change: TableChange['change'], rows: DiffRow[],
    extra: Partial<Pick<TableChange, 'addedColumns' | 'removedColumns' | 'unchanged'>> = {},
  ): TableChange => {
    const { shown, omitted } = limit(rows)
    return {
      type: 'table', kind: t.kind, name: t.name, change,
      columns: t.columns.map((c) => c.name),
      pkCols: t.columns.map((c, i) => (c.pk > 0 ? i : -1)).filter((i) => i >= 0),
      addedColumns: [], removedColumns: [], unchanged: 0,
      ...extra, rows: shown, omitted,
    }
  }

  // 作成・構造の変更・データの変更
  for (const [key, a] of Object.entries(after.tables)) {
    const b = before.tables[key]

    if (!b || b.kind !== a.kind) {
      // 新しく作られたテーブル（行はすべて「追加」）/ ビュー（中身をそのまま見せる）
      const mark: DiffMark = a.kind === 'table' ? '+' : ' '
      items.push(tableItem(a, 'created', a.rows.map((v) => ({ mark, values: v, changedCols: [] }))))
      continue
    }
    if (a.kind === 'view') continue   // ビューの中身は元テーブルの変化に付いてくるので対象外

    const bNames = new Set(b.columns.map((c) => c.name.toLowerCase()))
    const aNames = new Set(a.columns.map((c) => c.name.toLowerCase()))
    const sameCols = b.columns.length === a.columns.length && b.columns.every((c, i) => colKey(c) === colKey(a.columns[i]))

    if (!sameCols) {
      items.push(tableItem(a, 'altered', a.rows.map((v) => ({ mark: ' ' as const, values: v, changedCols: [] })), {
        addedColumns:   a.columns.filter((c) => !bNames.has(c.name.toLowerCase())).map((c) => c.name),
        removedColumns: b.columns.filter((c) => !aNames.has(c.name.toLowerCase())).map((c) => c.name),
      }))
      continue
    }

    const { rows, unchanged } = diffRows(a.columns, b.rows, a.rows)
    if (rows.length > 0) items.push(tableItem(a, 'data', rows, { unchanged }))
  }

  // 削除されたテーブル・ビュー
  const droppedTables = new Set<string>()
  for (const [key, b] of Object.entries(before.tables)) {
    if (after.tables[key]) continue
    droppedTables.add(key)
    items.push({
      type: 'table', kind: b.kind, name: b.name, change: 'dropped',
      columns: b.columns.map((c) => c.name), pkCols: [], addedColumns: [], removedColumns: [],
      rows: [], unchanged: 0, omitted: 0,
    })
  }

  // インデックス（テーブルごと消えたものは、テーブル側の「削除」に含まれるので除く）
  for (const [key, ix] of Object.entries(after.indexes)) {
    if (!before.indexes[key]) items.push({ type: 'index', name: ix.name, table: ix.table, columns: ix.columns, change: 'created' })
  }
  for (const [key, ix] of Object.entries(before.indexes)) {
    if (after.indexes[key] || droppedTables.has(ix.table.toLowerCase())) continue
    items.push({ type: 'index', name: ix.name, table: ix.table, columns: ix.columns, change: 'dropped' })
  }

  return { affectedRows, items }
}
