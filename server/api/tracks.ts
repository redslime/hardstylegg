import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const tracks = await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            artists: true
        }
    })

    if(tracks) {
        // setHeader(event, 'Cache-Control', 'public, max-age=86400') TODO: enable again (currently 1day, could be more probs)
        setHeader(event, 'Cache-Control', 'public, max-age=10') // 10 min
        return tracks
    }

    return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error"
    })
})