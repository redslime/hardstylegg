import {SpotifyApi} from "@spotify/web-api-ts-sdk";

let api: SpotifyApi | null = null

export function getSpotifyApi() {
    if(api) return api

    const config = useRuntimeConfig()
    api = SpotifyApi.withClientCredentials(config.spotifyClientId, config.spotifyClientSecret)
    return api
}