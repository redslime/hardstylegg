import {createError, defineEventHandler, getQuery} from 'h3'
import type {Track} from "~/types/models";
import {getSpotifyApi} from "~/server/utils/spotify";

function mapAlbum(item: any): Track {
    return <Track>{
        sid: item.id,
        title: item.name,
        artists: item.artists.map((a: any) => a.name).join(', '),
        year: parseInt(item.release_date.split('-')[0] ?? "1970"),
        cover_art: item.images[0]?.url?.replace("https://i.scdn.co/image/", "")
    }
}
function mapTrack(track: any, album: any): Track {
    return <Track>{
        sid: track.id,
        title: track.name,
        artists: track.artists.map((a: any) => a.name).join(', '),
        year: parseInt(album.release_date.split('-')[0] ?? "1970"),
        cover_art: album.images[0]?.url?.replace("https://i.scdn.co/image/", "")
    }
}

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

/**
 * Retry wrapper that handles 429 responses (Spotify rate limiting).
 * - Honors `Retry-After` header when provided (seconds)
 * - Falls back to exponential backoff with jitter otherwise
 */
async function requestWithRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err: any) {
            const status = err?.statusCode ?? err?.status ?? err?.response?.status;
            const headers = err?.headers ?? err?.response?.headers;

            const isRateLimit = status === 429;
            const canRetry = attempt < maxRetries;

            if (isRateLimit && canRetry) {
                // Try to read Retry-After (can be header string or header function)
                let retryAfterHeader: any = undefined;
                if (headers) {
                    retryAfterHeader = headers['retry-after'] ?? headers.get?.('retry-after');
                }
                let waitMs: number | undefined = undefined;
                if (retryAfterHeader) {
                    const secs = parseInt(String(retryAfterHeader), 10);
                    if (!isNaN(secs)) waitMs = secs * 1000;
                }
                if (!waitMs) {
                    // exponential backoff with jitter: 2^attempt * 1000 + [0..999]
                    waitMs = Math.min(30000, Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 1000));
                }

                await sleep(waitMs);
                attempt++;
                continue;
            }

            // For other transient network errors you might also want to retry.
            // If not rate limit or retries exhausted, rethrow.
            throw err;
        }
    }
}

export default defineEventHandler(async (event) => {
    try {
        const { user } = await requireUserSession(event)

        if (!user.admin) return createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const { artistId } = getQuery(event)
        if (!artistId) {
            return createError({ statusCode: 400, statusMessage: 'artistId required' })
        }

        const albums: Track[] = []
        const tracks: Track[] = []

        let total = 1 // cause the while to run at least once
        let collected = 0
        let offset = 0

        while(collected < total) {
            const data = await requestWithRetry(() => getSpotifyApi().artists.albums(artistId as string, "album,single", undefined, 50, offset))
            total = data.total

            for (const item of data.items) {
                if (item.album_type === "album") albums.push(mapAlbum(item))

                const childItems = await requestWithRetry(() => getSpotifyApi().albums.tracks(item.id))
                tracks.push(...childItems.items.map((track: any) => mapTrack(track, item)))
            }

            collected += data.items.length
            offset += data.items.length
        }

        tracks.sort((a, b) => b.year - a.year)

        return { albums, tracks }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        return createError({ statusCode: status, statusMessage: message })
    }
})
