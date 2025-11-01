import {defineEventHandler, readBody} from "h3";
import type {OrderContainer} from "~/types/gameModels";
import {validateOrder} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const order = await readBody<OrderContainer>(event)
    const errors: string[] = validateOrder(order)

    if (errors.length > 0) {
        return [...errors]
    }

    if(order.id) {
        // updating
        const fetched = await prisma.game_order.update({
            where: { id: order.id },
            data: {
                title: order.title,
                show_names: order.showNames,
                game_order_item: {
                    deleteMany: {
                        index: { notIn: order.items.map((i) => i.index!) },
                    },
                    upsert: order.items.map((item) => ({
                        where: {
                            parent_id_index: {
                                parent_id: order.id!!,
                                index: item.index!,
                            }
                        },
                        create: {
                            index: item.index!,
                            track_id: item.track.sid,
                        },
                        update: {
                            track_id: item.track.sid,
                        },
                    }))
                }
            },
            include: { game_order_item: true }
        })

        return <OrderContainer>{
            id: fetched.id,
            created_by: fetched.created_by,
            title: fetched.title,
            showNames: fetched.show_names,
            items: order.items
        }
    } else {
        // create new
        const fetched = await prisma.game_order.create({
            data: {
                created_by: order.created_by!!,
                title: order.title,
                show_names: order.showNames,
                game_order_item: {
                    create: order.items.map(item => {
                        return {
                            index: item.index,
                            track_id: item.track.sid,
                        }
                    })
                }
            },
            include: { game_order_item: true }
        })

        return <OrderContainer>{
            id: fetched.id,
            created_by: fetched.created_by,
            title: fetched.title,
            showNames: fetched.show_names,
            items: order.items
        }
    }
})