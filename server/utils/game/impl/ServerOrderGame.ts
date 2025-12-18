import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {OrderContainer, OrderItem} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem} from "~/types/models";

export class ServerOrderGame extends ServerGameDef<OrderContainer> {

    constructor() {
        super(GAME_METAS.Order);
    }

    override async fetchAllInstances(user: User): Promise<OrderContainer[]> {
        const instances = await prisma.game_order.findMany(this.whereAdminOrCreator(user))
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
    }

    override async fetchInstance(gameId: number): Promise<OrderContainer> {
        const parent = await prisma.game_order.findUnique({ where: { id: gameId } })
        const items = await prisma.game_order_item.findMany({ where: { parent_id: gameId } })
        const trackIds: string[] = items.map(i => i.track_id)
        const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
        const itemsFat = items.map(i => {
            const trackId = i.track_id
            const track = tracks.find(i => i.sid == trackId)
            return <OrderItem>{
                parent_id: i.parent_id,
                index: i.index,
                track: track
            }
        })
        return <OrderContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            title: parent!!.title,
            showNames: parent!!.show_names,
            items: itemsFat
        }
    }

    override async createInstance(instance: OrderContainer): Promise<OrderContainer> {
        const fetched = await prisma.game_order.create({
            data: {
                created_by: instance.created_by!!,
                title: instance.title,
                show_names: instance.showNames,
                game_order_item: {
                    create: instance.items.map(item => {
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
            items: instance.items
        }
    }

    override async updateInstance(instance: OrderContainer): Promise<OrderContainer> {
        const fetched = await prisma.game_order.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                show_names: instance.showNames,
                game_order_item: {
                    deleteMany: {
                        index: { notIn: instance.items.map((i) => i.index!) },
                    },
                    upsert: instance.items.map((item) => ({
                        where: {
                            parent_id_index: {
                                parent_id: instance.id!!,
                                index: item.index ?? -1,
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
            items: instance.items
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_order.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />'
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondCompleted(reportItem)
    }

    protected override async getPreviewOptions(gameId: number): Promise<number | "?"> {
        return await prisma.game_order_item.count({
            where: {
                parent_id: gameId,
            }
        })
    }
}