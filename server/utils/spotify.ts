import {SpotifyApi} from "@spotify/web-api-ts-sdk";

let api: SpotifyApi | null = null

export function getSpotifyApi() {
    if(api) return api

    const config = useRuntimeConfig()
    api = SpotifyApi.withClientCredentials(config.spotifyClientId, config.spotifyClientSecret)
    return api
}

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

/**
 * Retry wrapper that handles 429 responses (Spotify rate limiting).
 * - Honors `Retry-After` header when provided (seconds)
 * - Falls back to exponential backoff with jitter otherwise
 */
export async function requestWithRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
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