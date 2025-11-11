import prisma from "~/lib/prisma";
import type {NameXContainer} from "~/types/gameModels";
import type {Track} from "~/types/models";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const instances = await prisma.game_namex.findMany({
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
    const trackIds = instances.flatMap(i => {
        return JSON.parse(i.items) as string[]
    })
    const tracks = await prisma.track.findMany({
        where: {
            sid: {
                in: trackIds
            }
        }
    }) as Track[]

    return instances.map(i => {
        const { items, ...rest } = i
        const array = JSON.parse(i.items) as string[]
        const ts: Track[] = array.map(sid => tracks.find(t => t.sid === sid)!!)

        return <NameXContainer>{
            ...rest,
            items: ts
        }
    })
})