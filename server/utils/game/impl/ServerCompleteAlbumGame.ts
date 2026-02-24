import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem} from "~/types/models";
import type { game_complete_albumModel } from "~/generated/prisma/models";

export class ServerCompleteAlbumGame extends ServerGameDef<CompleteAlbumContainer> {

    constructor() {
        super(GAME_METAS.CompleteAlbum);
    }

    override async fetchAllInstances(user: User): Promise<CompleteAlbumContainer[]> {
        const instances = await prisma.game_complete_album.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<CompleteAlbumContainer[]> {
        const instances = await prisma.game_complete_album.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<CompleteAlbumContainer> {
        const parent = await prisma.game_complete_album.findUnique({ where: { id: gameId } })
        const album = await prisma.album.findUnique({ where: { sid: parent!!.album_id ?? "" } })
        const items = await prisma.game_complete_album_item.findMany({ where: { parent_id: gameId } })

        return <CompleteAlbumContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            album: album,
            items: items,
            context: parent!!.context
        }
    }

    override async createInstance(instance: CompleteAlbumContainer): Promise<CompleteAlbumContainer> {
        const fetched = await prisma.game_complete_album.create({
            data: {
                created_by: instance.created_by!!,
                album_id: instance.album?.sid,
                context: instance.context,
                game_complete_album_item: {
                    create: instance.items.map(item => {
                        return {
                            name: item.name.trim(),
                            artist: item.artist.trim(),
                            hidden: item.hidden
                        }
                    })
                }
            },
            include: { game_complete_album_item: true }
        })
        const { game_complete_album_item, album_id, ...rest } = fetched

        return <CompleteAlbumContainer>{
            ...rest,
            album: instance.album,
            items: game_complete_album_item
        }
    }

    override async updateInstance(instance: CompleteAlbumContainer): Promise<CompleteAlbumContainer> {
        const fetched = await prisma.game_complete_album.update({
            where: { id: instance.id },
            data: {
                album_id: instance.album?.sid,
                context: instance.context,
                game_complete_album_item: {
                    deleteMany: {
                        id: { notIn: instance.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    upsert: instance.items.map((item) => ({
                        where: { id: item.id ?? -1 },
                        create: {
                            name: item.name.trim(),
                            artist: item.artist.trim(),
                            hidden: item.hidden,
                            context: item.context
                        },
                        update: {
                            name: item.name.trim(),
                            artist: item.artist.trim(),
                            hidden: item.hidden,
                            context: item.context
                        },
                    }))
                }
            },
            include: { game_complete_album_item: true }
        })
        const { game_complete_album_item, album_id, ...rest } = fetched

        return <CompleteAlbumContainer>{
            ...rest,
            album: instance.album,
            items: game_complete_album_item
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_complete_album.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondCompleted(reportItem)
    }

    protected override async getPreviewOptions(gameId: number): Promise<number | "?"> {
        return await prisma.game_complete_album_item.count({
            where: {
                parent_id: gameId,
                hidden: true
            }
        })
    }

    override async getExistingTracks(): Promise<string[]> {
        const recs = await prisma.game_complete_album.findMany({
            select: {
                album_id: true
            }
        })
        return recs.filter(r => r != null && r.album_id != null).map(r => r.album_id!!)
    }

    async mapAll(instances: game_complete_albumModel[]): Promise<CompleteAlbumContainer[]> {
        const albums = await prisma.album.findMany({
            where: {
                sid: {
                    in: instances.map(i => i.album_id ?? "")
                }
            }
        })
        const items = await prisma.game_complete_album_item.findMany({
            where: {
                parent_id: {
                    in: instances.map(i => i.id)
                }
            }
        })

        return instances.map(i => {
            return <CompleteAlbumContainer>{
                id: i.id,
                created_by: i.created_by,
                album: albums.find(a => a.sid === i.album_id),
                items: items.filter(item => item.parent_id === i.id),
                context: i.context
            }
        })
    }
}