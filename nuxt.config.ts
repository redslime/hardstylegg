import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    ssr: true,
    // Tailwind v4: use the Vite plugin and CSS entry; no Nuxt Tailwind module needed
    devtools: { enabled: true },
    routeRules: {
        '/': { ssr: false },
        '/play': { ssr: false },
        '/share': { ssr: true },
    },
    vite: {
        plugins: [tailwindcss()],
        server: {
          watch: {
            ignored: ['**/data/**/*']
          }
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
    },
})
