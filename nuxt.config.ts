export default defineNuxtConfig({
  compatibilityDate: '2026-09-27',
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  css: ['~/assets/css/main.css'],

  // 静的ホスティング（S3 + CloudFront）向け。
  // 404.html と、SPA フォールバック用の 200.html を必ず出力する。
  nitro: {
    prerender: {
      failOnError: false,
    },
  },

  app: {
    head: {
      title: 'SQL演習教室｜ブラウザで学ぶ無料 SQL 演習サイト',
      htmlAttrs: { lang: 'ja' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '学園の業務データを題材に、ブラウザだけで SQL を練習できる無料の学習サイト。SELECT から JOIN・集計・サブクエリ・DDL / DML まで、全73問をその場で実行・採点できます。' },
        // OGP（SNS 共有時のカード表示）
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SQL演習教室' },
        { property: 'og:title', content: 'SQL演習教室｜ブラウザで学ぶ無料 SQL 演習サイト' },
        { property: 'og:description', content: 'ブラウザだけで SQL を書いて実行・採点できる無料の学習サイト。全73問。' },
        { property: 'og:url', content: 'https://sql-practice-classroom.com/' },
        { property: 'og:image', content: 'https://sql-practice-classroom.com/icon.png' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'SQL演習教室｜ブラウザで学ぶ無料 SQL 演習サイト' },
        { name: 'twitter:description', content: 'ブラウザだけで SQL を書いて実行・採点できる無料の学習サイト。全73問。' },
        { name: 'twitter:image', content: 'https://sql-practice-classroom.com/icon.png' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap',
        },
      ],
    },
  },

  // CDN経由でロードするため Vite のバンドルから除外
  vite: {
    optimizeDeps: {
      exclude: ['sql.js'],
    },
    build: {
      rollupOptions: {
        external: ['sql.js'],
      },
    },
  },
})
