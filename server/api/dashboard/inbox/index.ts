import prisma from "~/lib/prisma";
import type {InboxAlbum, InboxItem, InboxSlice, InboxTrack} from "~/types/models";

export default defineEventHandler(async (event): Promise<InboxSlice> => {
    const {user} = await requireUserSession(event)

    if(!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    const query = getQuery(event);
    const offset = query.offset ? Number(query.offset as string) : 0
    const limit = query.limit ? Number(query.limit) : 100
    const grouped: Record<string, InboxItem[]> = {}
    const totalCount = await prisma.radar_inbox.count()
    const items = await prisma.radar_inbox.findMany({
        orderBy: {
            added_on: "asc"
        },
        take: limit,
        skip: offset
    })

    items.forEach(item => {
        const dateKey = item.added_on.toISOString().split("T")[0]!!

        if(!grouped[dateKey]) {
            grouped[dateKey] = []
        }

        if(item.album) {
            grouped[dateKey]!!.push(JSON.parse(item.data) as InboxAlbum)
        } else {
            grouped[dateKey]!!.push(JSON.parse(item.data) as InboxTrack)
        }
    })

    return <InboxSlice>{
        totalCount,
        itemCount: items.length,
        offset,
        items: grouped
    }
})