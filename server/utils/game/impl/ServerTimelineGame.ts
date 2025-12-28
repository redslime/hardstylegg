import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {TimelineContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem} from "~/types/models";

export class ServerTimelineGame extends ServerGameDef<TimelineContainer> {

    constructor() {
        super(GAME_METAS.Timeline);
    }

    override async fetchAllInstances(user: User): Promise<TimelineContainer[]> {
        return await prisma.game_timeline.findMany(this.whereAdminOrCreator(user))
    }

    override async fetchInstance(gameId: number): Promise<TimelineContainer> {
        const parent = await prisma.game_timeline.findUnique({ where: { id: gameId } })

        return <TimelineContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            title: parent!!.title,
            goal: parent!!.goal,
            context: parent!!.context
        }
    }

    override async createInstance(instance: TimelineContainer): Promise<TimelineContainer> {
        return await prisma.game_timeline.create({
            data: {
                title: instance.title,
                created_by: instance.created_by!!,
                goal: instance.goal,
                context: instance.context
            }
        })
    }

    override async updateInstance(instance: TimelineContainer): Promise<TimelineContainer> {
        return await prisma.game_timeline.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                goal: instance.goal,
                context: instance.context
            }
        })
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_timeline.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />'
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        if(!reportItem.success && reportItem.items_clicked) {
            try {
                const array = JSON.parse(reportItem.items_clicked) as number[]

                if(array.length === 1 && array[0] && array[0] > 0) {
                    return array[0] + " off"
                }
            } catch(e: any) {
                console.error(e)
            }
        }

        return ""
    }
}