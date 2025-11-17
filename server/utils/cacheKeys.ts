import type {KeyCache} from "~/types/models";
import prisma from "~/lib/prisma";

let keys: KeyCache | null = null

export async function getCacheKeys(): Promise<KeyCache> {
    return keys ?? await loadKeys()
}

export function invalidateCacheKeys() {
    keys = null
}

async function loadKeys(): Promise<KeyCache> {
    try {
        const trackChecksum = await prisma.$queryRawUnsafe<any[]>("CHECKSUM TABLE track")
        const trackCacheKey = `${trackChecksum[0].f1}`

        const albumChecksum = await prisma.$queryRawUnsafe<any[]>("CHECKSUM TABLE album")
        const albumCacheKey = `${albumChecksum[0].f1}`

        keys = {
            tracks: trackCacheKey,
            albums: albumCacheKey
        }
    } catch (e: any) {
        keys = {
            tracks: Date.now().toString(),
            albums: Date.now().toString()
        }
    }

    return keys
}