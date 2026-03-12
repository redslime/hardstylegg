import {FlatAlbum, FlatArtist, FlatTrack} from "~/types/content";
import prisma from "~/lib/prisma";

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

export async function getAlbum(albumId: string): Promise<FlatAlbum> {
    return await getFlatAlbums([albumId]).then(a => a[0]!!)
}

export async function getFlatAlbums(albumIds: string[]): Promise<FlatAlbum[]> {
    const recs = await prisma.album.findMany({
        select: {
            sid: true,
            title: true,
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
            image: rec.cover_art
        }
    }).map(FlatTrack.fromJson)
}