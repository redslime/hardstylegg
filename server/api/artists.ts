import prisma from "~/lib/prisma";
import {FlatArtist, type FlatTrack} from "~/types/content";

export default defineEventHandler(async (event): Promise<FlatArtist[]> => {
    setHeader(event, 'Cache-Control', 'public, max-age=2592000') // 1 month
    
    return await prisma.artist.findMany({
        select: {
            id: true,
            name: true,
        }
    })
})