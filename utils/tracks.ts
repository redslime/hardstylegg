import type {ShallowTrack, Track} from "~/types/models"
import {getTrackCacheParam} from "~/utils/cacheKeys";
import axios from "axios";

let tracks: ShallowTrack[] | null = null

export function getName(track: ShallowTrack): string {
    return `${track.artists} - ${track.title}`
}

export async function getTracks(progress?: (percent: number) => void): Promise<ShallowTrack[]> {
    // If already cached, report complete and return
    if (tracks !== null) {
        progress?.(100)
        return tracks
    }
    progress?.(0)
    const v = await getTrackCacheParam()

    const response = await axios.get<ShallowTrack[]>('/api/tracks' + v, {
        onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progress?.(percentCompleted);
            }
        }
    });

    tracks = response.data;
    progress?.(100)
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