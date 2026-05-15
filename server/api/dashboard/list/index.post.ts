import type {List} from "~/types/models";
import prisma from "~/lib/prisma";
import {getContentId} from "~/types/content";
import {mapLists} from "~/server/api/dashboard/list/index";

export default defineEventHandler(async (event): Promise<List> => {
    const list = await readBody<List>(event)
    const {user} = await requireUserSession(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    console.log("user", user.name, "updating list:", list)

    const fetched = await prisma.list.upsert({
        where: {
            id: list.id
        },
        create: {
            created_by: list.createdBy,
            type: list.type,
            name: list.name,
            description: list.description,
            icon: list.icon,
            list_item: {
                create: list.items.map(item => ({
                    item_id: getContentId(item.item),
                    index: item.index,
                    context: item.context
                }))
            }
        },
        update: {
            created_by: list.createdBy,
            type: list.type,
            name: list.name,
            description: list.description,
            icon: list.icon,
            list_item: {
                deleteMany: {},
                create: list.items.map(item => ({
                    item_id: getContentId(item.item),
                    index: item.index,
                    context: item.context
                }))
            }
        },
        include: {
            list_item: {
                orderBy: {
                    index: 'asc'
                }
            }
        }
    })

    return await mapLists([fetched]).then(l => l[0]!!)
})