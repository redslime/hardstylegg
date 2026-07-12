import type {KeyCache} from "~/types/models";

let keys: KeyCache | null = null

export async function getCacheParam(key: keyof KeyCache): Promise<string> {
    return `?v=${await getCacheKey(key)}`
}

export function getInjectedCacheKey(key: keyof KeyCache): string | undefined {
    if (import.meta.client && (window as any).__CACHE_KEYS__) {
        keys = (window as any).__CACHE_KEYS__ as KeyCache
        return keys[key]
    }

    const payload = useNuxtApp().payload
    if (payload.cacheKeys) {
        keys = payload.cacheKeys as KeyCache
        return keys[key]
    }
}

export async function getCacheKey(key: keyof KeyCache): Promise<string> {
    if(keys !== null) return keys[key]

    if (import.meta.server) {
        try {
            const { getCacheKeys } = await import("~/server/utils/cacheKeys")
            keys = await getCacheKeys()
            return keys[key]
        } catch (e) { }
    }

    return getInjectedCacheKey(key) || (await loadKeys())[key]
}

async function loadKeys(): Promise<KeyCache> {
    try {
        keys = await $fetch<KeyCache>('/api/cache')
    } catch (e: any) {
        keys = {
            tracks: Date.now().toString(),
            albums: Date.now().toString(),
            artists: Date.now().toString(),
            lists: Date.now().toString(),
            graph: Date.now().toString()
        }
    }

    return keys
}