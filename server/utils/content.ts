import {FlatAlbum, FlatArtist, FlatTrack, RichArtist, RichTrack} from "~/types/content";
import prisma from "~/lib/prisma";
import {getSpotifyApi} from "#server/utils/spotify";

export async function getArtist(artistId: string): Promise<FlatArtist> {
    return await getArtists([artistId]).then(a => a[0]!!)
}

export async function getArtists(artistIds: string[]): Promise<FlatArtist[]> {
    return await prisma.artist.findMany({
        select: {
            id: true,
            name: true
        },
        where: {
            id: {
                in: artistIds
            }
        }
    }).then(a => a.map(FlatArtist.fromJson))
}

export async function getRichArtists(artistIds: string[]): Promise<RichArtist[]> {
    return await prisma.artist.findMany({
        select: {
            id: true,
            name: true,
            image: true
        },
        where: {
            id: {
                in: artistIds
            }
        }
    }).then(a => a.map(RichArtist.fromJson))
}

export async function getOrFetchArtistImages(artistIds: string[]): Promise<Record<string, string | null>> {
    const locals = await getRichArtists(artistIds)
    const missing = artistIds.filter(id => !locals.some(a => a.id === id) || !locals.find(a => a.id === id)?.image)

    if(missing.length === 0) {
        return locals.reduce((acc, item) => {
            acc[item.id] = item.image!!
            return acc
        }, {} as Record<string, string>)
    } else {
        const records = {} as Record<string, string | null>
        locals.forEach(a => records[a.id] = a.image ?? null)

        for(const id of missing) {
            const fetched = await getSpotifyApi().artists.get(id)
            records[fetched.id] = fetched.images[0]?.url?.replace("https://i.scdn.co/image/", "") ?? null
        }

        return records
    }
}

export async function getAlbum(albumId: string): Promise<FlatAlbum> {
    return await getFlatAlbums([albumId]).then(a => a[0]!!)
}

export async function getFlatAlbums(albumIds: string[]): Promise<FlatAlbum[]> {
    const recs = await prisma.album.findMany({
        select: {
            sid: true,
            title: true,
            date: true,
            cover_art: true,
            album_artist: {
                select: {
                    artist: true
                }
            }
        },
        where: {
            sid: {
                in: albumIds
            }
        }
    })

    return recs.map(rec => {
        return <FlatAlbum>{
            sid: rec.sid,
            title: rec.title,
            artists: rec.album_artist.map(a => a.artist.name).join(" & "),
            year: rec.date.getFullYear(),
            image: rec.cover_art
        }
    })
}

export async function getFlatTrack(trackId: string): Promise<FlatTrack> {
    return await getFlatTracks([trackId]).then(a => a[0]!!)
}

export async function getFlatTracks(trackIds: string[]): Promise<FlatTrack[]> {
    const recs = await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            date: true,
            cover_art: true,
            track_artist: {
                select: {
                    artist: true
                }
            }
        },
        where: {
            sid: {
                in: trackIds
            }
        }
    })

    return recs.map(rec => {
        return <FlatTrack>{
            sid: rec.sid,
            title: rec.title,
            artists: rec.track_artist.map(a => a.artist.name).join(" & "),
            year: rec.date.getFullYear(),
            image: rec.cover_art
        }
    }).map(FlatTrack.fromJson)
}

export async function getRichTracks(trackIds: string[]): Promise<RichTrack[]> {
    const recs = await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            date: true,
            cover_art: true,
            hidden: true,
            track_artist: {
                select: {
                    artist: true
                }
            }
        },
        where: {
            sid: {
                in: trackIds
            }
        }
    })

    return recs.map(rec => {
        return <RichTrack>{
            sid: rec.sid,
            title: rec.title,
            date: rec.date,
            artists: rec.track_artist.map(a => a.artist),
            image: rec.cover_art,
            hidden: rec.hidden
        }
    })
}