import { SCHEMA_SQL, SEED_SQL } from '~/data/schema'

export type SqlResult = { columns: string[]; values: (string | number | null)[][] }[]

// --- シングルトンDB（アプリ全体で共有・読み取り専用の基準DB）---
let _db: any = null
let _SQL: any = null          // sql.js コンストラクタ
let _initPromise: Promise<void> | null = null

function loadSqlJsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).initSqlJs) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
    script.onload  = () => resolve()
    script.onerror = () => reject(new Error('sql-wasm.js のロードに失敗しました'))
    document.head.appendChild(script)
  })
}

export function useDatabase() {
  const isReady    = useState<boolean>('db:ready',   () => false)
  const initMessage = useState<string>('db:initMsg', () => '')

  async function init() {
    if (_db) { isReady.value = true; return }
    if (_initPromise) { await _initPromise; isReady.value = true; return }

    _initPromise = (async () => {
      initMessage.value = 'sql.js WASM をロード中…'
      await loadSqlJsScript()

      const initSqlJs = (window as any).initSqlJs as (config: object) => Promise<any>
      _SQL = await initSqlJs({
        locateFile: (file: string) =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
      })

      initMessage.value = 'テーブルを作成中…'
      _db = new _SQL.Database()
      _db.run(SCHEMA_SQL)

      initMessage.value = 'サンプルデータを挿入中…'
      _db.run(SEED_SQL)

      initMessage.value = '完了'
      isReady.value = true
    })()

    await _initPromise
  }

  /**
   * 通常の SELECT 用：メインDBで実行（DBを変更しない）
   */
  function exec(sql: string): SqlResult {
    if (!_db) throw new Error('DB が初期化されていません')
    return _db.exec(sql) as SqlResult
  }

  /**
   * DDL/DML 用サンドボックス実行：
   * メインDBのバイナリスナップショットから一時コピーを作成して実行する。
   * 実行後にコピーを破棄するため、メインDBは元のままで保たれる。
   */
  function execSandbox(sql: string): SqlResult {
    if (!_db || !_SQL) throw new Error('DB が初期化されていません')

    // メインDBの現在のバイナリをエクスポートして新しいDBインスタンスに読み込む
    const snapshot = _db.export()                     // Uint8Array
    const sandbox  = new _SQL.Database(snapshot)      // スナップショットから生成

    try {
      const result = sandbox.exec(sql) as SqlResult
      return result
    } finally {
      sandbox.close()   // 必ず後片付け
    }
  }

  return { isReady, initMessage, init, exec, execSandbox }
}
