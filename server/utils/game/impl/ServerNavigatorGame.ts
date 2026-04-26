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
        return '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M21,12c0,4.97-4.03,9-9,9S3,16.97,3,12,7.03,3,12,3s9,4.03,9,9Z"/>' +
            '<path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.02,11.26l-2.44,4.16,4.16-2.44c.1-.06.18-.14.24-.24l2.44-4.16-4.16,2.44c-.1.06-.18.14-.24.24Z"/>'
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