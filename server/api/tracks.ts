import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // setHeader(event, 'Cache-Control', 'public, max-age=86400') TODO: enable again (currently 1day, could be more probs)
    setHeader(event, 'Cache-Control', 'public, max-age=600') // 10 min
    return await prisma.track.findMany({
        select: {
            sid: true,
            title: true,
            artists: true
        }
    })
})