import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    ssr: true,

    // Tailwind v4: use the Vite plugin and CSS entry; no Nuxt Tailwind module needed
    devtools: { enabled: true },

    routeRules: {
        '/benelux.geojson': {
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        },
        '/fonts/Anton-Regular.ttf': {
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        },
        '/share': { ssr: true },
        '/': { ssr: false },
        '/play/**': { ssr: false },
        '/test': { ssr: false },
        '/admin/**': { ssr: false, appLayout: 'dashboard' },
        '/archive': { ssr: false },
        '/graph': { ssr: false },
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
            },
            viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
            meta: [
                { name: 'theme-color', content: '#010D15' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-title', content: 'hardstyle.gg' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
            ],
        }
    },

    nitro: {
        preset: 'node-server',
        replace: {
            'import * as process': 'import * as processUnused',
        },
    },

    modules: ['nuxt-auth-utils', '@vite-pwa/nuxt'],

    runtimeConfig: {
        discordClientSecret: process.env.NUXT_DISCORD_CLIENT_SECRET,
        spotifyClientId: process.env.NUXT_SPOTIFY_CLIENT_ID,
        spotifyClientSecret: process.env.NUXT_SPOTIFY_CLIENT_SECRET,
        public: {
            appUrl: process.env.NUXT_PUBLIC_APP_URL,
            discordClientId: process.env.NUXT_PUBLIC_DISCORD_CLIENT_ID,
            isDev: process.env.NODE_ENV !== 'production',
            testCookies: process.env.TEST_COOKIES,
        }
    },

    pwa: {
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'public',
        filename: 'sw.js',
        manifest: {
            name: 'hardstyle.gg',
            short_name: 'hardstyle.gg',
            theme_color: '#0F172A',
            background_color: '#0F172A',
            icons: [
                {
                    src: 'img/icon512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: 'img/icon512-maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ],
            display: 'standalone',
            orientation: 'portrait'
        },
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico,geojson}']
        },
        devOptions: {
            enabled: true,
            type: 'module',
            navigateFallback: '/'
        }
    },
})