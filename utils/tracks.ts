import type {ShallowTrack} from "~/types/models"
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