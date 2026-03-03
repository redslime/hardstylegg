import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
    return await prisma.album.findMany()
})