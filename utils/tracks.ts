export interface ShallowTrack {
    sid: string
    title: string
    artists: string
}

export function getName(track: ShallowTrack): string {
    return `${track.artists} - ${track.title}`
}

export async function getTracks(): Promise<ShallowTrack[]> {
    console.log("fetching all tracks...")
    const tracks = await $fetch<ShallowTrack[]>('/api/tracks')
    console.log(`fetched ${tracks.length} tracks`)
    return tracks
    // return tracks.map((t) => ({
    //     sid: t.sid,
    //     name: `${t.artists} - ${t.title}`
    // }))
}