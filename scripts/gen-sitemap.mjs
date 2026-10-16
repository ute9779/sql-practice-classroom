// sitemap.xml を .output/public に生成する。
// `npm run generate` の後に実行される（package.json の scripts 参照）。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'https://sql-practice-classroom.com'
const outDir = path.join(root, '.output', 'public')

if (!fs.existsSync(outDir)) {
  console.error('[gen-sitemap] .output/public が見つかりません。先に `npm run generate` を実行してください。')
  process.exit(1)
}

// data/questions.ts から問題 ID を抽出（TS を実行せず、正規表現で拾う）
const questionsSrc = fs.readFileSync(path.join(root, 'data', 'questions.ts'), 'utf8')
const ids = [...questionsSrc.matchAll(/^\s*id:\s*(\d+),/gm)].map((m) => Number(m[1]))
if (ids.length === 0) {
  console.error('[gen-sitemap] 問題 ID を抽出できませんでした。')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

// 固定ページ + 各問題ページ。priority はトップを高く、情報ページを低めに。
const urls = [
  { loc: '/',          priority: '1.0', changefreq: 'weekly'  },
  { loc: '/questions', priority: '0.9', changefreq: 'weekly'  },
  { loc: '/about',     priority: '0.3', changefreq: 'monthly' },
  { loc: '/privacy',   priority: '0.2', changefreq: 'yearly'  },
  { loc: '/licenses',  priority: '0.2', changefreq: 'yearly'  },
  ...ids.map((id) => ({ loc: `/questions/${id}`, priority: '0.7', changefreq: 'monthly' })),
]

const body = urls
  .map(
    (u) =>
      `  <url>\n` +
      `    <loc>${BASE}${u.loc}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml)
console.log(`[gen-sitemap] sitemap.xml を生成しました（${urls.length} URL / 問題 ${ids.length} 問）`)
