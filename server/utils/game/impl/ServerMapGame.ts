import type {MapContainer} from "~/types/gameModels";
import prisma from "~/lib/prisma";
import type {User} from "#auth-utils";
import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import {GAME_METAS} from "#shared/games";
import type {game_mapModel} from "~/generated/prisma/models/game_map";

export class ServerMapGame extends ServerGameDef<MapContainer> {

    constructor() {
        super(GAME_METAS.Map);
    }

    override async fetchAllInstances(user: User): Promise<MapContainer[]> {
        return prisma.game_map.findMany(this.whereAdminOrCreator(user)).then(this.mapAll)
    }

    override async fetchInstances(ids: number[]): Promise<MapContainer[]> {
        return prisma.game_map.findMany(this.whereIdIn(ids)).then(this.mapAll)
    }

    override async fetchInstance(gameId: number): Promise<MapContainer> {
        const parent = await prisma.game_map.findUnique({ where: { id: gameId } })

        return <MapContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            title: parent!!.title,
            goal: parent!!.goal,
            context: parent!!.context,
            type: parent!!.type
        }
    }

    override async createInstance(instance: MapContainer): Promise<MapContainer> {
        return prisma.game_map.create({
            data: {
                title: instance.title,
                created_by: instance.created_by!!,
                goal: instance.goal,
                context: instance.context,
                type: instance.type
            }
        }).then(this.map)
    }

    override async updateInstance(instance: MapContainer): Promise<MapContainer> {
        return prisma.game_map.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                goal: instance.goal,
                context: instance.context,
                type: instance.type
            }
        }).then(this.map)
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_map.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />';
    }

    private map(model: game_mapModel): MapContainer {
        const { type, ...rest } = model
        return <MapContainer>{
            ...rest,
            type: type
        }
    }

    private mapAll(models: game_mapModel[]): MapContainer[] {
        return models.map(m => {
            const { type, ...rest } = m
            return <MapContainer>{
                ...rest,
                type: type
            }
        })
    }
}