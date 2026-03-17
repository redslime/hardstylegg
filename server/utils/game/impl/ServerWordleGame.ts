import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {WordleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import type {game_wordleModel} from "~/generated/prisma/models";
import {getArtist, getArtists} from "~/server/utils/content";
import prisma from "~/lib/prisma";
import type {FlatArtist} from "~/types/content";

export class ServerWordleGame extends ServerGameDef<WordleContainer> {

    constructor() {
        super(GAME_METAS.Wordle);
    }

    override async fetchAllInstances(user: User): Promise<WordleContainer[]> {
        const instances = await prisma.game_wordle.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<WordleContainer[]> {
        const instances = await prisma.game_wordle.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<WordleContainer> {
        const parent = await prisma.game_wordle.findUnique({ where: { id: gameId } })
        const artistInstance = await getArtist(parent!!.artist)

        return this.map(parent!!, artistInstance)
    }

    override async createInstance(instance: WordleContainer): Promise<WordleContainer> {
        const fetched = await prisma.game_wordle.create({
            data: {
                created_by: instance.created_by!!,
                context: instance.context,
                artist: instance.artist.id
            }
        })

        return this.map(fetched, instance.artist)
    }

    override async updateInstance(instance: WordleContainer): Promise<WordleContainer> {
        const fetched = await prisma.game_wordle.update({
            where: { id: instance.id },
            data: {
                created_by: instance.created_by!!,
                context: instance.context,
                artist: instance.artist.id
            }
        })

        return this.map(fetched, instance.artist)
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_wordle.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M20 9.33333V6C20 4.89543 19.1046 4 18 4H14.6667M20 9.33333H14.6667M20 9.33333V14.6667M4 9.33333V6C4 4.89543 4.89543 4 6 4H9.33333M4 9.33333H9.33333M4 9.33333V14.6667M14.6667 9.33333H9.33333M14.6667 9.33333V4M14.6667 9.33333V14.6667M9.33333 9.33333V4M9.33333 9.33333V14.6667M20 14.6667V18C20 19.1046 19.1046 20 18 20H14.6667M20 14.6667H14.6667M4 14.6667V18C4 19.1046 4.89543 20 6 20H9.33333M4 14.6667H9.33333M14.6667 14.6667H9.33333M14.6667 14.6667V20M9.33333 14.6667V20M9.33333 4H14.6667M9.33333 20H14.6667" />';
    }

    map(instance: game_wordleModel, artistInstance: FlatArtist): WordleContainer {
        const { artist, ...rest } = instance
        return <WordleContainer>{
            ...rest,
            artist: artistInstance
        }
    }

    async mapAll(instances: game_wordleModel[]): Promise<WordleContainer[]> {
        const artistIds = instances.map(r => r.artist)
        const artists = await getArtists(artistIds)

        return instances.map(i => {
            const { artist, ...rest } = i
            return <WordleContainer>{
                ...rest,
                artist: artists.find(a => a.id === artist)
            }
        })
    }
}