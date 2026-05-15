import type {KeyCache} from "~/types/models";

let keys: KeyCache | null = null

export async function getCacheParam(key: keyof KeyCache): Promise<string> {
    return `?v=${await getCacheKey(key)}`
}

export async function getCacheKey(key: keyof KeyCache): Promise<string> {
    if(keys !== null) return keys[key]
    return (await loadKeys())[key]
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
        }
    }

    return keys
}