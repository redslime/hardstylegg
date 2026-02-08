import type {ShallowTrack, Track} from "~/types/models"
import {getTrackCacheParam} from "~/utils/cacheKeys";

let tracks: ShallowTrack[] | null = null

export function getName(track: ShallowTrack): string {
    return `${track.artists} - ${track.title}`
}

export async function getTracks(): Promise<ShallowTrack[]> {
    if(tracks !== null) return tracks
    const v = await getTrackCacheParam()
    tracks = await $fetch<ShallowTrack[]>('/api/tracks' + v)
    return tracks
}

export function getTrackUrl(track: Track | ShallowTrack, isAlbum: boolean): string {
    const isYouTube = track.sid.startsWith("yt:")

    if(isYouTube) {
        return `https://www.youtube.com/watch?v=${track.sid.replace("yt:", "")}`
    } else {
        if(isAlbum) {
            return `https://open.spotify.com/album/${track.sid}`
        } else {
            return `https://open.spotify.com/track/${track.sid}`
        }
    }
}