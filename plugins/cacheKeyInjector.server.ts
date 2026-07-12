import {getCacheKeys} from "~/server/utils/cacheKeys";

export default defineNuxtPlugin(async (nuxtApp) => {
    if (import.meta.server) {
        nuxtApp.payload.cacheKeys = await getCacheKeys()
    }
})
