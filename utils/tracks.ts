import type {ShallowTrack} from "~/types/models"

let tracks: ShallowTrack[] | null = null

export function getName(track: ShallowTrack): string {
    return `${track.artists} - ${track.title}`
}

export async function getTracks(): Promise<ShallowTrack[]> {
    if(tracks !== null) return tracks
    tracks = await $fetch<ShallowTrack[]>('/api/tracks')
    return tracks
}