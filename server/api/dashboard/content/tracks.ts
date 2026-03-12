import prisma from "~/lib/prisma";
import type {RichTrack} from "~/types/content";

const isDev = useRuntimeConfig().public.isDev

export default defineEventHandler(async (event): Promise<RichTrack[]> => {
    if(!isDev) {
        setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
    } else {
        setHeader(event, 'Cache-Control', 'private, max-age=600') // 10 minutes
    }

    const recs = await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            year: true,
            cover_art: true,
            hidden: true,
            track_artist: {
                select: {
                    artist: true
                }
            }
        }
    })

    return recs.map(rec => {
        return <RichTrack>{
            sid: rec.sid,
            title: rec.title,
            year: rec.year,
            artists: rec.track_artist.map(a => a.artist),
            image: rec.cover_art,
            hidden: rec.hidden
        }
    })
})