import type {KeyCache} from "~/types/models";

let keys: KeyCache | null = null

export async function getTrackCacheParam(): Promise<string> {
    return `?v=${await getTrackCacheKey()}`
}

export async function getTrackCacheKey(): Promise<string> {
    if(keys !== null) return keys.tracks
    return (await loadKeys()).tracks
}

export async function getAlbumCacheParam(): Promise<string> {
    return `?v=${await getAlbumCacheKey()}`
}

export async function getAlbumCacheKey(): Promise<string> {
    if(keys !== null) return keys.albums
    return (await loadKeys()).albums
}

async function loadKeys(): Promise<KeyCache> {
    try {
        keys = await $fetch<KeyCache>('/api/cache')
    } catch (e: any) {
        keys = {
            tracks: Date.now().toString(),
            albums: Date.now().toString()
        }
    }

    return keys
}