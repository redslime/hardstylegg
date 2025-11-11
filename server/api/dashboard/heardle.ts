import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)

    const instances = await prisma.game_heardle.findMany({
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
    const trackIds = instances.map(i => i.track_id)
    const tracks = await prisma.track.findMany({
        where: {
            sid: {
                in: trackIds
            }
        }
    })

    return instances.map(i => {
        const { track_id, durations, ...rest } = i
        const array = JSON.parse(durations) as number[]
        return {
            ...rest,
            durations: array,
            track: tracks.find(t => t.sid === i.track_id)
        }
    })
})