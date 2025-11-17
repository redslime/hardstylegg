import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    return await prisma.game_map.findMany({
        where: {
            ...(user.admin ? { } : {
                OR: [
                    {
                        created_by: user.id
                    },
                    {
                        id: 1
                    }
                ]
            })
        }
    })
})