/**
 * サイト全体で使う固定情報。
 */
export const SITE = {
  name:    'SQL演習教室',
  /** 著作権表示に使う名前。空のままなら「個人開発」とだけ表示する */
  author:  'SQL演習教室',
  /** 問い合わせ先の X（旧Twitter）アカウントの URL。空ならリンクを出さない。 */
  twitterUrl: 'https://x.com/ute979',
  /** 著作権表示の開始年 */
  year:    2026,
} as const

/** 使用している主な OSS（ライセンス表記用） */
export const OSS_LICENSES = [
  { name: 'sql.js',              version: '1.10.2', license: 'MIT',  url: 'https://github.com/sql-js/sql.js' },
  { name: 'Nuxt',                version: '3.x',    license: 'MIT',  url: 'https://nuxt.com' },
  { name: 'Vue',                 version: '3.x',    license: 'MIT',  url: 'https://vuejs.org' },
  { name: 'Tailwind CSS',        version: '3.x',    license: 'MIT',  url: 'https://tailwindcss.com' },
  { name: 'Noto Sans JP',        version: '',       license: 'SIL Open Font License 1.1', url: 'https://fonts.google.com/noto/specimen/Noto+Sans+JP' },
  { name: 'JetBrains Mono',      version: '',       license: 'SIL Open Font License 1.1', url: 'https://www.jetbrains.com/lp/mono/' },
] as const
