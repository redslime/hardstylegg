import tailwindcss from "@tailwindcss/vite";
import {resolve} from "pathe";

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
              dir:     resolve(__dirname, '/public/artwork'),
              baseURL: '/artwork1',
          },
          {
              dir:     resolve(__dirname, '../public/artwork'),
              baseURL: '/artwork2',
          },
          {
              dir:    '../public/artwork',
              baseURL: '/artwork3',
          },
          {
              dir:    'public/artwork',
              baseURL: '/artwork4',
          },
          {
              dir:    'server/public/artwork',
              baseURL: '/artwork5',
          },
          {
              dir:    '.output/server/public/artwork',
              baseURL: '/artwork6',
          },
          {
              dir:    resolve('public/artwork'),
              baseURL: '/artwork7',
          },
          {
              dir:    resolve('./public/artwork'),
              baseURL: '/artwork8',
          },
          {
              dir:    resolve('../public/artwork'),
              baseURL: '/artwork9',
          },
          {
              dir:     '../public/heardle',
              baseURL: '/heardle3',
          },
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