import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {NameXContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem, Track} from "~/types/models";

export class ServerNameXGame extends ServerGameDef<NameXContainer> {

    constructor() {
        super(GAME_METAS.NameX);
    }

    override async fetchAllInstances(user: User): Promise<NameXContainer[]> {
        const instances = await prisma.game_namex.findMany(this.whereAdminOrCreator(user))
        const trackIds = instances.flatMap(i => {
            if(i.tracks) {
                return JSON.parse(i.items) as string[]
            } else {
                return []
            }
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

            if(i.tracks) {
                const ts: Track[] = array.map(sid => tracks.find(t => t.sid === sid)!!)

                return <NameXContainer>{
                    ...rest,
                    items: ts
                }
            } else {
                return <NameXContainer>{
                    ...rest,
                    items: array
                }
            }
        })
    }

    override async fetchInstance(gameId: number): Promise<NameXContainer> {
        const parent = await prisma.game_namex.findUnique({ where: { id: gameId } })
        const trackIds: string[] = JSON.parse(parent!!.items)
        const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
        const trackById = new Map(tracks.map(t => [t.sid, t]))
        const orderedTracks = trackIds.map(id => trackById.get(id)).filter(Boolean) as typeof tracks
        return <NameXContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            goal: parent!!.goal,
            title: parent!!.title,
            tracks: parent!!.tracks,
            items: orderedTracks
        }
    }

    override async createInstance(instance: NameXContainer): Promise<NameXContainer> {
        const array = instance.tracks ?
            JSON.stringify((instance.items as Track[]).map(i => i.sid)) : JSON.stringify(instance.items as string[])
        const fetched = await prisma.game_namex.create({
            data: {
                created_by: instance.created_by!!,
                title: instance.title,
                goal: instance.goal,
                tracks: instance.tracks ?? false,
                items: array
            }
        })
        const { items, ...rest } = fetched
        return <NameXContainer>{
            ...rest,
            items: instance.items
        }
    }

    override async updateInstance(instance: NameXContainer): Promise<NameXContainer> {
        const array = instance.tracks ?
            JSON.stringify((instance.items as Track[]).map(i => i.sid)) : JSON.stringify(instance.items as string[])
        const fetched = await prisma.game_namex.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                goal: instance.goal,
                tracks: instance.tracks ?? false,
                items: array
            }
        })
        const { items, ...rest } = fetched
        return <NameXContainer>{
            ...rest,
            items: instance.items
        }
    }

    override async deleteInstance(gameId: number): Promise<any> {
        return await prisma.game_namex.delete(this.whereGameId(gameId))
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />'
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        if(reportItem.success) {
            return this.respondAttempts(reportItem)
        } else {
            return this.respondCompleted(reportItem)
        }
    }

    protected override async getPreviewOptions(gameId: number): Promise<number | "?"> {
        const nameX = await prisma.game_namex.findUnique({
            select: {
                goal: true
            },
            where: {
                id: gameId
            }
        })
        return nameX?.goal ?? "?"
    }
}