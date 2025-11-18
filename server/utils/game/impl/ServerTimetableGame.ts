import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {TimetableContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem} from "~/types/models";

export class ServerTimetableGame extends ServerGameDef<TimetableContainer> {

    constructor() {
        super(GAME_METAS.Timetable);
    }

    override async fetchAllInstances(user: User): Promise<TimetableContainer[]> {
        const parents = await prisma.game_timetable.findMany(this.whereAdminOrCreator(user))
        const items = await prisma.game_timetable_item.findMany()

        return parents.map(parent => {
            const { color_bg, color_text, ...rest } = parent
            return {
                ...rest,
                color_bg: "#" + color_bg,
                color_text: "#" + color_text,
                items: items.filter(item => item.parent_id === parent.id)
            } as TimetableContainer
        })
    }

    override async fetchInstance(gameId: number): Promise<TimetableContainer> {
        const parent = await prisma.game_timetable.findUnique({ where: { id: gameId } })
        const items = await prisma.game_timetable_item.findMany({ where: { parent_id: gameId } })
        return <TimetableContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            title: parent!!.title,
            color_bg: "#" + parent!!.color_bg,
            color_text: "#" + parent!!.color_text,
            items: items
        }
    }

    override async createInstance(instance: TimetableContainer): Promise<TimetableContainer> {
        const fetched = await prisma.game_timetable.create({
            data: {
                created_by: instance.created_by!,
                title: instance.title,
                color_bg: instance.color_bg.replace("#", ""),
                color_text: instance.color_text.replace("#", ""),
                game_timetable_item: {
                    create: instance.items.map(item => {
                        return {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        }
                    })
                }
            },
            include: { game_timetable_item: true }
        })

        const { game_timetable_item, color_bg, color_text, ...rest } = fetched
        return <TimetableContainer>{
            ...rest,
            color_bg: "#" + color_bg,
            color_text: "#" + color_text,
            items: game_timetable_item
        }
    }

    override async updateInstance(instance: TimetableContainer): Promise<TimetableContainer> {
        const fetched = await prisma.game_timetable.update({
            where: { id: instance.id },
            data: {
                created_by: instance.created_by!,
                title: instance.title,
                color_bg: instance.color_bg.replace("#", ""),
                color_text: instance.color_text.replace("#", ""),
                game_timetable_item: {
                    deleteMany: {
                        id: { notIn: instance.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    upsert: instance.items.map((item) => ({
                        where: { id: item.id ?? -1 },
                        create: {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        },
                        update: {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        }
                    }))
                }
            },
            include: { game_timetable_item: true }
        })

        const { game_timetable_item, color_bg, color_text, ...rest } = fetched
        return <TimetableContainer>{
            ...rest,
            color_bg: "#" + color_bg,
            color_text: "#" + color_text,
            items: game_timetable_item
        }
    }

    override async deleteInstance(gameId: number): Promise<any> {
        return await prisma.game_timetable.delete(this.whereGameId(gameId))
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />'
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondCompleted(reportItem)
    }

    protected override async getPreviewOptions(gameId: number): Promise<number | "?"> {
        return await prisma.game_timetable_item.count({
            where: {
                parent_id: gameId,
                hidden: true
            }
        })
    }
}