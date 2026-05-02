import prisma from "~/lib/prisma";
import {RichTrack} from "~/types/content";

export default defineEventHandler(async (event): Promise<RichTrack[]> => {
    const id = event.context.params?.id

    if(id) {
        return await prisma.track.findMany({
            where: {
                hidden: false,
                track_artist: {
                    some: {
                        artist_id: id
                    },
                },
            },
            orderBy: [
                {
                    date: "desc"
                },
                {
                    cover_art: "asc"
                }
            ],
            select: {
                sid: true,
                title: true,
                date: true,
                cover_art: true,
                track_artist: {
                    select: {
                        artist: true,
                    },
                },
            },
        }).then(arr => arr.map(entry => {
            const { track_artist, cover_art, ...rest } = entry

            return {
                ...rest,
                artists: track_artist.flatMap(a => a.artist),
                image: cover_art
            }
        }).map(RichTrack.mapJson))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: 'Artist id must be given'
        })
    }
})