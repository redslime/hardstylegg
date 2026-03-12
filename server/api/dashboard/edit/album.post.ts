import {defineEventHandler, readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import {RichAlbum} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const album = await readBody<RichAlbum>(event).then(RichAlbum.mapJson)

    if(!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    invalidateCacheKeys()
    const rec = await prisma.album.upsert({
        where: {
            sid: album.sid
        },
        create: {
            sid: album.sid,
            title: album.title,
            year: album.year,
            cover_art: album.image,
            hidden: album.hidden ?? false,
            album_artist: {
                create: album.artists.map((artist) => ({
                    artist: {
                        connect: {id: artist.id}
                    }
                }))
            }
            // ,
            // album_track: {
            //     create: album.tracks.map((track, index) => ({
            //         index,
            //         track: {
            //             connect: {sid: track.sid}
            //         }
            //     }))
            // }
        },
        update: {
            title: album.title,
            year: album.year,
            cover_art: album.image,
            hidden: album.hidden ?? false,
            album_artist: {
                deleteMany: {},
                create: album.artists.map((artist) => ({
                    artist: {
                        connect: {id: artist.id}
                    }
                }))
            }
            // ,
            // album_track: {
            //     deleteMany: {},
            //     create: album.tracks.map((track, index) => ({
            //         index,
            //         track: {
            //             connect: {sid: track.sid}
            //         }
            //     }))
            // }
        },
        include: {
            album_artist: {
                include: {
                    artist: true
                }
            },
            album_track: {
                orderBy: {
                    index: "asc"
                },
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
        }
    })

    return <RichAlbum>{
        sid: rec.sid,
        title: rec.title,
        year: rec.year,
        image: rec.cover_art,
        hidden: rec.hidden,
        artists: rec.album_artist.map((a) => a.artist),
        tracks: rec.album_track.map((t) => ({
            sid: t.track.sid,
            title: t.track.title,
            year: t.track.year,
            image: t.track.cover_art,
            hidden: t.track.hidden,
            artists: t.track.track_artist.map((ta) => ta.artist)
        }))
    }
})