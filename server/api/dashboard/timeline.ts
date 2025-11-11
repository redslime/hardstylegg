import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    return await prisma.game_timeline.findMany({
        where: {
            OR: [
                {
                    ...(user.admin ? {} : { created_by: user.id })
                },
                {
                    id: 1
                }
            ]
        }
    })
})