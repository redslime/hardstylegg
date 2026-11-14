import {FlatAlbum, FlatArtist, FlatTrack, RichAlbum, RichArtist, RichTrack} from "~/types/content";
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

export async function getRichAlbumsYearly(year: number): Promise<RichAlbum[]> {
    const recs = await prisma.album.findMany({
        where: {
            date: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            },
            hidden: false
        },
        include: {
            album_artist: {
                include: {
                    artist: true
                }
            },
            album_track: {
                include: {
                    track: {
                        include: {
                            track_artist: {
                                include: {
                                    artist: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            date: 'asc'
        }
    })

    return recs.map(rec => {
        return <RichAlbum>{
            sid: rec.sid,
            title: rec.title,
            date: rec.date,
            artists: rec.album_artist.map(a => a.artist),
            tracks: rec.album_track.map(t => t.index)
                .sort((n1, n2) => n1 - n2) // ensure the index order is kept
                .map(i => rec.album_track.find(t => t.index === i)!.track)
                .map(t => <RichTrack>{
                    sid: t.sid,
                    title: t.title,
                    date: t.date,
                    artists: t.track_artist.map(a => a.artist),
                    image: t.cover_art,
                    hidden: t.hidden
                }),
            image: rec.cover_art,
            hidden: rec.hidden
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

export async function getRichTracksYearly(year: number): Promise<RichTrack[]> {
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
            date: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            },
            hidden: false
        },
        orderBy: {
            date: 'asc'
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