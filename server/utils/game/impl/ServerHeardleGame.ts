import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {HeardleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import {join} from "pathe";
import {unlink} from "node:fs/promises";
import type {ReportItem} from "~/types/models";

export class ServerHeardleGame extends ServerGameDef<HeardleContainer> {

    constructor() {
        super(GAME_METAS.Heardle);
    }

    override async fetchAllInstances(user: User): Promise<HeardleContainer[]> {
        const instances = await prisma.game_heardle.findMany(this.whereAdminOrCreator(user))
        const trackIds = instances.map(i => i.track_id)
        const tracks = await prisma.track.findMany({
            where: {
                sid: {
                    in: trackIds
                }
            }
        })

        return <HeardleContainer[]> instances.map(i => {
            const { track_id, durations, ...rest } = i
            const array = JSON.parse(durations) as number[]
            return {
                ...rest,
                durations: array,
                track: tracks.find(t => t.sid === i.track_id)
            }
        })
    }

    override async fetchInstance(gameId: number): Promise<HeardleContainer> {
        const parent = (await prisma.game_heardle.findUnique({ where: { id: gameId } }))
        const flattenDurations: number[] = JSON.parse(parent!!.durations)
        const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })
        return <HeardleContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            track: track,
            src: parent!!.src,
            durations: flattenDurations,
        }
    }

    override async createInstance(instance: HeardleContainer): Promise<HeardleContainer> {
        const fetched = await prisma.game_heardle.create({
            data: {
                created_by: instance.created_by!!,
                src: instance.src,
                durations: JSON.stringify(instance.durations),
                track_id: instance.track.sid
            }
        })
        const { track_id, durations, ...rest } = fetched
        return <HeardleContainer>{
            ...rest,
            durations: JSON.parse(durations) as number[],
            track: instance.track
        }
    }

    override async updateInstance(instance: HeardleContainer): Promise<HeardleContainer> {
        const fetched = await prisma.game_heardle.update({
            where: { id: instance.id },
            data: {
                src: instance.src,
                durations: JSON.stringify(instance.durations),
                track_id: instance.track.sid
            }
        })
        const { track_id, durations, ...rest } = fetched
        return <HeardleContainer>{
            ...rest,
            durations: JSON.parse(durations) as number[],
            track: instance.track
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_heardle.delete(this.whereGameIdAndAdminOrCreator(gameId, user))

        if(gameId === deleted.id) {
            const mp3Path = join(process.cwd(), 'data', 'heardle', deleted.src + '.mp3')
            await unlink(mp3Path)
            return true
        }

        return false
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />'
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }
}