import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    if(user.admin) return await prisma.user.findMany()
    return []
})