// https://v3.nuxtjs.org/api/configuration/nuxt.config
console.log("nuxt.config.ts APP_TITLE", process.env.APP_TITLE);
console.log("nuxt.config.ts API_HOST", process.env.API_HOST);
import eslintPlugin from 'vite-plugin-eslint';

export default defineNuxtConfig({
  modules: [
    'nuxt-icon',
    '@pinia/nuxt',
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
    meta: [
      { name: 'theme-color', content: '#F97A19' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
    ],
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover'
  }
  }
} as any)