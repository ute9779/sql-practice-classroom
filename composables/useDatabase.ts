import { SCHEMA_SQL, SEED_SQL } from '~/data/schema'
import type { SqlResult, QueryFn } from '~/utils/judge'

// --- シングルトンDB（アプリ全体で共有する基準DB）---
// ユーザーが入力した SQL は絶対にこの基準DBでは実行しない（withSandbox を使うこと）
let _db: any = null
let _SQL: any = null          // sql.js コンストラクタ
let _snapshot: Uint8Array | null = null   // 初期化直後の基準DBのバイナリ
let _initPromise: Promise<void> | null = null

/** CDN が応答しないときに、ローディングが回り続けないようにするための上限時間 */
const INIT_TIMEOUT_MS = 30_000

/** 一定時間で終わらない処理を失敗扱いにする */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

function loadSqlJsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).initSqlJs) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
    script.onload  = () => resolve()
    script.onerror = () => {
      script.remove()   // 再試行時に失敗した script タグが残らないようにする
      reject(new Error('sql-wasm.js のロードに失敗しました'))
    }
    document.head.appendChild(script)
  })
}

export function useDatabase() {
  const isReady     = useState<boolean>('db:ready',   () => false)
  const initMessage = useState<string>('db:initMsg',  () => '')
  /** 初期化に失敗したときのエラー内容（空文字なら失敗していない） */
  const initError   = useState<string>('db:initErr',  () => '')

  /** 基準DBの構築。途中で失敗したら中途半端な状態を捨てて例外を投げる */
  async function build() {
    try {
      initMessage.value = 'sql.js WASM をロード中…'
      await withTimeout(loadSqlJsScript(), INIT_TIMEOUT_MS, 'sql-wasm.js の読み込みがタイムアウトしました')

      const initSqlJs = (window as any).initSqlJs as (config: object) => Promise<any>
      _SQL = await withTimeout(
        initSqlJs({
          locateFile: (file: string) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
        }),
        INIT_TIMEOUT_MS,
        'sql.js の初期化がタイムアウトしました',
      )

      initMessage.value = 'テーブルを作成中…'
      _db = new _SQL.Database()
      _db.run(SCHEMA_SQL)

      initMessage.value = 'サンプルデータを挿入中…'
      _db.run(SEED_SQL)

      // サンドボックス生成用に、初期状態のバイナリを1回だけ取得して保持する
      _snapshot = _db.export()

      initMessage.value = '完了'
    } catch (e) {
      try { _db?.close() } catch { /* 既に閉じている */ }
      _db = null
      _snapshot = null
      throw e
    }
  }

  /**
   * DB を初期化する。失敗してもここでは例外を投げず、initError に内容を入れる。
   * 失敗後にもう一度呼べば、最初からやり直す（再試行）。
   */
  async function init() {
    if (_db && _snapshot) { isReady.value = true; initError.value = ''; return }

    isReady.value = false
    initError.value = ''

    if (!_initPromise) {
      const p = build()
      _initPromise = p
      // 失敗した Promise を保持し続けると再試行できないので破棄する
      p.catch(() => { if (_initPromise === p) _initPromise = null })
    }

    try {
      await _initPromise
      isReady.value = true
    } catch (e: any) {
      initError.value = e?.message ?? String(e)
      initMessage.value = ''
      isReady.value = false
    }
  }

  /**
   * アプリ内部の固定SQL専用（テーブル参照画面の SELECT * など）。基準DBで直接実行する。
   * ユーザーが入力した SQL には使わないこと。
   */
  function exec(sql: string): SqlResult {
    if (!_db) throw new Error('DB が初期化されていません')
    return _db.exec(sql) as SqlResult
  }

  /**
   * ユーザーの SQL 用サンドボックス：
   * 初期状態のスナップショットから使い捨てのDBを作り、fn に実行関数を渡す。
   * fn の終了後（例外時も）DBは必ず破棄されるので、基準DBは変更されない。
   * 1回の withSandbox の中では変更が引き継がれる（DML 実行後の状態確認などに使う）。
   */
  function withSandbox<T>(fn: (run: QueryFn) => T): T {
    if (!_SQL || !_snapshot) throw new Error('DB が初期化されていません')

    const sandbox = new _SQL.Database(_snapshot.slice())   // 毎回コピーから生成
    try {
      return fn((sql: string) => sandbox.exec(sql) as SqlResult)
    } finally {
      sandbox.close()   // 必ず後片付け
    }
  }

  return { isReady, initMessage, initError, init, exec, withSandbox }
}
