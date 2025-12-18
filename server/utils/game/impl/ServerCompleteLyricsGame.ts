import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";

export class ServerCompleteLyricsGame extends ServerGameDef<CompleteLyricsContainer> {

    constructor() {
        super(GAME_METAS.CompleteLyrics);
    }

    override async fetchAllInstances(user: User): Promise<CompleteLyricsContainer[]> {
        const instances = await prisma.game_complete_lyrics.findMany(this.whereAdminOrCreator(user))
        const trackIds = instances.map(i => i.track_id)
        const tracks = await prisma.track.findMany({
            where: {
                sid: {
                    in: trackIds
                }
            }
        })

        return instances.map(i => {
            const { track_id, ...rest } = i
            const track = tracks.find(t => t.sid === track_id)
            return <CompleteLyricsContainer>{
                ...rest,
                track
            }
        })
    }

    override async fetchInstance(gameId: number): Promise<CompleteLyricsContainer> {
        const parent = await prisma.game_complete_lyrics.findUnique({ where: { id: gameId } })
        const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })
        return <CompleteLyricsContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            text: parent!!.text,
            track: track
        }
    }

    override async createInstance(instance: CompleteLyricsContainer): Promise<CompleteLyricsContainer> {
        const { track_id, ...rest } = await prisma.game_complete_lyrics.create({
            data: {
                created_by: instance.created_by!!,
                text: instance.text,
                track_id: instance.track.sid
            }
        })
        const track = await prisma.track.findUnique({
            where: { sid: instance.track.sid }
        })
        return <CompleteLyricsContainer>{
            ...rest,
            track
        }
    }

    override async updateInstance(instance: CompleteLyricsContainer): Promise<CompleteLyricsContainer> {
        const { track_id, ...rest } = await prisma.game_complete_lyrics.update({
            where: { id: instance.id },
            data: {
                text: instance.text,
                track_id: instance.track.sid
            }
        })
        const track = await prisma.track.findUnique({
            where: { sid: instance.track.sid }
        })
        return <CompleteLyricsContainer> {
            ...rest,
            track
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_complete_lyrics.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />'
    }

    override async getExistingTracks(): Promise<string[]> {
        const recs = await prisma.game_complete_lyrics.findMany({
            select: {
                track_id: true
            }
        })
        return recs.map(r => r.track_id)
    }
}