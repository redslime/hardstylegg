import type {FlatAlbum} from "~/types/content";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event): Promise<FlatAlbum[]> => {
    setHeader(event, 'Cache-Control', 'public, max-age=2592000') // 1 month

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
            hidden: false
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
})