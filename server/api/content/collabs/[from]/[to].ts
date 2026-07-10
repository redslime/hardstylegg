import {RichTrack} from "~/types/content";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event): Promise<RichTrack[]> => {
    const from = event.context.params?.from
    const to = event.context.params?.to

    if (!from || !to) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing from or to artist id"
        })
    }

    const tracks = await prisma.track.findMany({
        where: {
            hidden: false,
            AND: [
                {
                    track_artist: {
                        some: {
                            artist_id: from,
                        },
                    },
                },
                {
                    track_artist: {
                        some: {
                            artist_id: to,
                        },
                    },
                },
            ],
        },
        include: {
            track_artist: {
                include: {
                    artist: true,
                },
            }
        },
        orderBy: {
            date: "desc",
        },
    });

    return tracks.map(track => {
        return <RichTrack>{
            sid: track.sid,
            title: track.title,
            date: track.date,
            artists: track.track_artist.map(trackArtist => trackArtist.artist),
            image: track.cover_art,
            hidden: track.hidden,
        };
    });
})