import {createError, defineEventHandler, getQuery} from "h3";
import {getSpotifyApi} from "~/server/utils/spotify";
import {type RichTrack} from "~/types/content";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";

export default defineEventHandler(async (event) => {
    try {
        const {user} = await requireUserSession(event)

        if (!user.admin) return createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const {trackId} = getQuery(event)
        if (!trackId) {
            return createError({statusCode: 400, statusMessage: 'trackId required'})
        }

        const track = await getSpotifyApi().tracks.get(trackId as string)
        const rec =await prisma.track.upsert({
            where: {
                sid: track.id,
            },
            create: {
                sid: track.id,
                title: track.name,
                year: parseInt(track.album.release_date.split('-')[0] ?? "1970"),
                cover_art: track.album.images[0]?.url?.replace("https://i.scdn.co/image/", ""),
                hidden: false,
                track_artist: {
                    create: track.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name
                                }
                            }
                        },
                    })),
                },
            },
            update: {
                sid: track.id,
                title: track.name,
                year: parseInt(track.album.release_date.split('-')[0] ?? "1970"),
                cover_art: track.album.images[0]?.url?.replace("https://i.scdn.co/image/", ""),
                hidden: false,
                track_artist: {
                    deleteMany: {},
                    create: track.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name
                                }
                            }
                        },
                    })),
                },
            },
            include: {
                track_artist: {
                    include: {
                        artist: true,
                    },
                },
            },
        })

        invalidateCacheKeys()

        return <RichTrack>{
            sid: rec.sid,
            title: rec.title,
            year: rec.year,
            artists: rec.track_artist.map(a => a.artist),
            image: rec.cover_art,
            hidden: rec.hidden
        }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        return createError({ statusCode: status, statusMessage: message })
    }
})