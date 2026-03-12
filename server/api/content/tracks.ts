import prisma from "~/lib/prisma";
import type {FlatTrack} from "~/types/content";

export default defineEventHandler(async (event): Promise<FlatTrack[]> => {
    setHeader(event, 'Cache-Control', 'public, max-age=2592000') // 1 month
    
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
            hidden: false
        }
    })

    return recs.map(rec => {
        return <FlatTrack>{
            sid: rec.sid,
            title: rec.title,
            artists: rec.track_artist.map(a => a.artist.name).join(" & "),
            image: rec.cover_art
        }
    })
})