import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    return await prisma.track.findMany({
        take: 50
    })
})