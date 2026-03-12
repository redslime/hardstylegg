import {getCacheParam} from "~/utils/cacheKeys";
import axios from "axios";
import {FlatAlbum, FlatArtist, FlatTrack} from "~/types/content";

let tracks: FlatTrack[] | null = null
let albums: FlatAlbum[] | null = null
let artists: FlatArtist[] | null = null

export async function getTracks(progress?: (percent: number) => void): Promise<FlatTrack[]> {
    // If already cached, report complete and return
    if (tracks !== null) {
        progress?.(100)
        return tracks
    }

    progress?.(0)
    const v = await getCacheParam("tracks")
    const response = await axios.get<FlatTrack[]>('/api/content/tracks' + v, {
        onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progress?.(percentCompleted);
            }
        }
    });

    tracks = response.data.map(FlatTrack.fromJson);
    progress?.(100)
    return tracks
}

export async function getAlbums(progress?: (percent: number) => void): Promise<FlatAlbum[]> {
    // If already cached, report complete and return
    if (albums !== null) {
        progress?.(100)
        return albums
    }

    progress?.(0)
    const v = await getCacheParam("albums")
    const response = await axios.get<FlatTrack[]>('/api/content/albums' + v, {
        onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progress?.(percentCompleted);
            }
        }
    });

    albums = response.data.map(FlatAlbum.fromJson);
    progress?.(100)
    return albums
}

export async function getArtists(progress?: (percent: number) => void): Promise<FlatArtist[]> {
    // If already cached, report complete and return
    if (artists !== null) {
        progress?.(100)
        return artists
    }

    progress?.(0)
    const v = await getCacheParam("artists")
    const response = await axios.get<FlatTrack[]>('/api/artists' + v, {
        onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progress?.(percentCompleted);
            }
        }
    });

    artists = response.data.map(FlatArtist.fromJson);
    progress?.(100)
    return artists
}