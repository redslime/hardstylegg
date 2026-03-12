import {defineEventHandler, readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import {RichTrack} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const track = await readBody<RichTrack>(event).then(RichTrack.mapJson)

    if(!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    invalidateCacheKeys()
    const rec = await prisma.track.upsert({
        where: {
            sid: track.sid,
        },
        create: {
            sid: track.sid,
            title: track.title,
            year: track.year,
            cover_art: track.image,
            hidden: track.hidden ?? false,
            track_artist: {
                create: track.artists.map((artist) => ({
                    artist: {
                        connect: { id: artist.id },
                    },
                })),
            },
        },
        update: {
            title: track.title,
            year: track.year,
            cover_art: track.image,
            hidden: track.hidden ?? false,
            track_artist: {
                deleteMany: {},
                create: track.artists.map((artist) => ({
                    artist: {
                        connect: { id: artist.id },
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

    return <RichTrack>{
        sid: rec.sid,
        title: rec.title,
        year: rec.year,
        artists: rec.track_artist.map(a => a.artist),
        image: rec.cover_art,
        hidden: rec.hidden
    }
})