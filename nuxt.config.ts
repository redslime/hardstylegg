import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  ssr: true,

  // Tailwind v4: use the Vite plugin and CSS entry; no Nuxt Tailwind module needed
  devtools: { enabled: true },

  routeRules: {
      '/share': { ssr: true },
      '/': { ssr: false },
      '/play': { ssr: false },
      '/tracks': { ssr: false },
      '/admin/**': { ssr: false }
  },

  vite: {
      plugins: [tailwindcss()],
      server: {
        watch: {
          ignored: ['**/data/**/*']
        }
      },
      optimizeDeps: {
          exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
      },
  },

  css: ["~/assets/main.css"],

  app: {
      head: {
        title: 'hardstyle.gg',
        htmlAttrs: {
          'data-theme': 'night'
        }
      }
  },

  nitro: {
      preset: 'node-server',
      replace: {
          'import * as process': 'import * as processUnused',
      },
      publicAssets: [
          {
              dir: 'public/artwork',
              baseURL: '/artwork'
          },
          {
              dir: 'public/heardle',
              baseURL: '/heardle'
          }
      ]
  },

  modules: ['nuxt-auth-utils'],

  runtimeConfig: {
      discordClientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET,
      public: {
          appUrl: process.env.APP_URL,
          discordClientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID
      }
  }
})