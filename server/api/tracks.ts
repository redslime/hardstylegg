import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    setHeader(event, 'Cache-Control', 'public, max-age=2592000') // 1 month
    return await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            artists: true
        }
    })
})