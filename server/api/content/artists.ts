import prisma from "~/lib/prisma";
import {RichArtist} from "~/types/content";

export default defineEventHandler(async (event): Promise<RichArtist[]> => {
    setHeader(event, 'Cache-Control', 'public, max-age=2592000') // 1 month
    
    return await prisma.artist.findMany({
        select: {
            id: true,
            name: true,
            image: true
        },
    }).then(a => a.map(RichArtist.mapJson))
})