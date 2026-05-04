import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {PuzzleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {game_puzzleModel} from "~/generated/prisma/models/game_puzzle";
import {getRichTracks} from "~/server/utils/content";
import type {ReportItem} from "~/types/models";

export class ServerPuzzleGame extends ServerGameDef<PuzzleContainer> {

    constructor() {
        super(GAME_METAS.Puzzle);
    }

    override async fetchAllInstances(user: User): Promise<PuzzleContainer[]> {
        const instances = await prisma.game_puzzle.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<PuzzleContainer[]> {
        const instances = await prisma.game_puzzle.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<PuzzleContainer> {
        const parent = await prisma.game_puzzle.findUnique({ where: { id: gameId } })
        const trackIds = JSON.parse(parent!!.track_ids) as string[]
        const tracks = await getRichTracks(trackIds)

        return <PuzzleContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            tracks,
            context: parent!!.context
        }
    }

    override async createInstance(instance: PuzzleContainer): Promise<PuzzleContainer> {
        const fetched = await prisma.game_puzzle.create({
            data: {
                created_by: instance.created_by!!,
                track_ids: JSON.stringify(instance.tracks.map(t => t.sid)),
                context: instance.context
            }
        })

        return <PuzzleContainer>{
            id: fetched!!.id,
            created_by: fetched!!.created_by,
            tracks: instance.tracks,
            context: fetched!!.context
        }
    }

    override async updateInstance(instance: PuzzleContainer): Promise<PuzzleContainer> {
        const fetched = await prisma.game_puzzle.update({
            where: { id: instance.id },
            data: {
                created_by: instance.created_by!!,
                track_ids: JSON.stringify(instance.tracks.map(t => t.sid)),
                context: instance.context
            }
        })

        return <PuzzleContainer>{
            id: fetched!!.id,
            created_by: fetched!!.created_by,
            tracks: instance.tracks,
            context: fetched!!.context
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_puzzle.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        if(reportItem.success) {
            return this.respondAttempts(reportItem)
        } else {
            return this.respondCompleted(reportItem)
        }
    }

    protected override async getPreviewOptions(gameId: number): Promise<number | "?"> {
        const parent = await prisma.game_puzzle.findUnique({ where: { id: gameId } })

        if(parent) {
            const trackIds = JSON.parse(parent.track_ids) as string[]
            return trackIds.length
        } else {
            return "?"
        }
    }

    async mapAll(instances: game_puzzleModel[]): Promise<PuzzleContainer[]> {
        const trackIds = instances.flatMap(i => JSON.parse(i.track_ids) as string[])
        const tracks = await getRichTracks(trackIds)

        return instances.map(i => {
            const trackIds = JSON.parse(i.track_ids) as string[]

            return <PuzzleContainer>{
                id: i.id,
                created_by: i.created_by,
                tracks: tracks.filter(t => trackIds.includes(t.sid)),
                context: i.context
            }
        })
    }
}