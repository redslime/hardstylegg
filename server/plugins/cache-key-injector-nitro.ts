import {getCacheKeys} from "~/server/utils/cacheKeys";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:html', async (html, { event }) => {
        const keys = await getCacheKeys()
        const script = `<script>window.__CACHE_KEYS__ = ${JSON.stringify(keys)}</script>`
        html.head.push(script)
    })
})
