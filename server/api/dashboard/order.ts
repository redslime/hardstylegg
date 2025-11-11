import prisma from "~/lib/prisma";
import type {OrderContainer, OrderItem} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const instances = await prisma.game_order.findMany({
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
    const items = await prisma.game_order_item.findMany()
    const trackIds = items.map(i => i.track_id)
    const tracks = await prisma.track.findMany({
        where: {
            sid: {
                in: trackIds
            }
        }
    })

    return instances.map(instance => {
        const children: OrderItem[] = items.filter(item => item.parent_id === instance.id).map(item => {
            const { track_id, ...rest } = item
            const track = tracks.find(t => t.sid === item.track_id)
            return <OrderItem>{
                ...rest,
                track
            }
        })
        children.sort((a, b) => a.index - b.index)

        return <OrderContainer>{
            id: instance.id,
            created_by: instance.created_by,
            title: instance.title,
            showNames: instance.show_names,
            items: children
        }
    })
})