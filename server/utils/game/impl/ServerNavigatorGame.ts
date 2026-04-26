import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {NavigatorContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {game_navigatorModel} from "~/generated/prisma/models/game_navigator";
import {getRichArtists} from "~/server/utils/content";
import type {ReportItem} from "~/types/models";

export class ServerNavigatorGame extends ServerGameDef<NavigatorContainer> {

    constructor() {
        super(GAME_METAS.Navigator);
    }

    override async fetchAllInstances(user: User): Promise<NavigatorContainer[]> {
        const instances = await prisma.game_navigator.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<NavigatorContainer[]> {
        const instances = await prisma.game_navigator.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<NavigatorContainer> {
        const parent = await prisma.game_navigator.findUnique({ where: { id: gameId } })
        const artists = await getRichArtists([parent!!.from_artist_id, parent!!.to_artist_id])

        return <NavigatorContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            from: artists.find(a => a.id === parent!!.from_artist_id),
            to: artists.find(a => a.id === parent!!.to_artist_id),
            steps: parent!!.max_steps,
            context: parent!!.context
        }
    }

    override async createInstance(instance: NavigatorContainer): Promise<NavigatorContainer> {
        const fetched = await prisma.game_navigator.create({
            data: {
                created_by: instance.created_by!!,
                from_artist_id: instance.from.id,
                to_artist_id: instance.to.id,
                max_steps: instance.steps,
                context: instance.context
            }
        })

        return <NavigatorContainer>{
            id: fetched!!.id,
            created_by: fetched!!.created_by,
            from: instance.from,
            to: instance.to,
            steps: fetched!!.max_steps,
            context: fetched!!.context
        }
    }

    override async updateInstance(instance: NavigatorContainer): Promise<NavigatorContainer> {
        const fetched = await prisma.game_navigator.update({
            where: { id: instance.id },
            data: {
                from_artist_id: instance.from.id,
                to_artist_id: instance.to.id,
                max_steps: instance.steps,
                context: instance.context
            }
        })

        return <NavigatorContainer>{
            id: fetched!!.id,
            created_by: fetched!!.created_by,
            from: instance.from,
            to: instance.to,
            steps: fetched!!.max_steps,
            context: fetched!!.context
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_navigator.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path fill="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m0 12c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12c-6.627 0-12-5.373-12-12zm2.017 0c0 5.513 4.469 9.983 9.983 9.983s9.983-4.469 9.983-9.983c0-5.513-4.469-9.983-9.983-9.983-5.513 0-9.983 4.469-9.983 9.983zm8.278-.928c0-.001 0-.002 0-.002 0-.005.002-.01.006-.013.066-.108.136-.202.213-.289l-.002.002c.02-.024.041-.046.062-.068.071-.076.147-.146.228-.209l.004-.003c.027-.021.056-.037.083-.057s.075-.054.115-.078l6.483-3.795-3.783 6.464v.002c0 .005-.003.01-.007.012-.066.109-.136.203-.213.29l.002-.002c-.02.024-.041.046-.061.068-.071.076-.148.145-.229.208l-.004.003c-.027.021-.055.038-.083.057s-.075.054-.115.078l-6.483 3.796z" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }

    async mapAll(instances: game_navigatorModel[]): Promise<NavigatorContainer[]> {
        const artistIds = instances.flatMap(i => [i.from_artist_id, i.to_artist_id])
        const artists = await getRichArtists(artistIds)

        return <NavigatorContainer[]> instances.map(i => {
            const { from_artist_id, to_artist_id, max_steps, ...rest } = i

            return {
                ...rest,
                steps: max_steps,
                from: artists.find(a => a.id === from_artist_id)!!,
                to: artists.find(a => a.id === to_artist_id)!!,
            }
        })
    }
}