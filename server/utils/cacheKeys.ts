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
    const track = await getChecksum("track")
    const album = await getChecksum("album")
    const artist = await getChecksum("artist")
    const trackArtist = await getChecksum("track_artist")
    const albumArtist = await getChecksum("album_artist")

    try {
        keys = {
            tracks: `${track}${trackArtist}${artist}`,
            albums: `${album}${albumArtist}${artist}`,
            artists: artist
        }
    } catch (e: any) {
        keys = {
            tracks: Date.now().toString(),
            albums: Date.now().toString(),
            artists: Date.now().toString()
        }
    }

    return keys
}

async function getChecksum(table: string): Promise<string> {
    const checksum = await prisma.$queryRawUnsafe<any[]>(`CHECKSUM TABLE ${table}`)
    return `${checksum[0].f1}`
}