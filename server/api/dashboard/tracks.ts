import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    return await prisma.track.findMany({
        take: 50
    })
})