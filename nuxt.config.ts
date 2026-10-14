export default defineNuxtConfig({
  compatibilityDate: '2026-09-27',
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'SQL演習教室',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
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
