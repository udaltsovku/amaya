// https://v3.nuxtjs.org/api/configuration/nuxt.config
console.log("nuxt.config.ts APP_TITLE", process.env.APP_TITLE);
console.log("nuxt.config.ts API_HOST", process.env.API_HOST);
import eslintPlugin from 'vite-plugin-eslint';

export default defineNuxtConfig({
  modules: [
    'nuxt-icon',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
  ],
  ssr: true,
  runtimeConfig: {
    public: {
      apiHost: process.env.API_HOST || "http://localhost:3000",
      appTitle: process.env.APP_TITLE || "qr-landing",
    },
    contentfulToken: process.env.CONTENTFUL_TOKEN,
    contentfulSpace: process.env.CONTENTFUL_SPACE,
    contentfulEnv: process.env.CONTENTFUL_ENV,
    contentfulCmaToken: process.env.CONTENTFUL_CMA_TOKEN,
    sanityReadToken: process.env.SANITY_READ_TOKEN,
    sanityWriteToken: process.env.SANITY_WRITE_TOKEN,
    sanityProjectId: process.env.SANITY_PROJECT_ID,
    sanityDataset: process.env.SANITY_DATASET,
    sanityApiVersion: process.env.SANITY_API_VERSION || '2026-01-19',
  },
  googleFonts: {
    families: {
      Nunito: [400, 700, 950], // Нужные веса
    },
    display: 'swap', // Текст виден сразу (важно для LCP)
    download: true,  // Скачать локально (важно для скорости)
    preconnect: true,
  },
  css: [
    "@/assets/styles/pages.scss",
  ],
  imports: {
    dirs: [
      'composables/**'
    ]
  },
  vite:{
    plugins:[
      eslintPlugin({
        failOnError: false,
        failOnWarning: false,
      })
    ]
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en' 
      },
      meta: [
        { name: 'theme-color', content: '#F97A19' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover'
    }
  },
  experimental: {
    inlineSSRStyles: true
  },

  render: {
    // Это заставит Nuxt качать только то, что нужно здесь и сейчас
    resourceHints: false 
  },
  hooks: {
    'build:manifest': (manifest: any) => {
      // Этот хак удаляет лишние предзагрузки из манифеста для Nuxt 3
      for (const key in manifest) {
        manifest[key].prefetch = false
        manifest[key].preload = false
      }
    }
  },

  nitro: {
    compressPublicAssets: true, // Сжимает картинки, стили и скрипты
    minify: true,               // Дополнительно чистит код сервера
  },
} as any)