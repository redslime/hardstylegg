import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    return await prisma.album.findMany({})
})