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
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />'
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