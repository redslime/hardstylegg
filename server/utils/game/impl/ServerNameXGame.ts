import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {NameXContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {ReportItem} from "~/types/models";
import type {game_namexModel} from "~/generated/prisma/models";
import {FlatAlbum, FlatArtist, FlatTrack} from "~/types/content";

export class ServerNameXGame extends ServerGameDef<NameXContainer> {

    constructor() {
        super(GAME_METAS.NameX);
    }

    override async fetchAllInstances(user: User): Promise<NameXContainer[]> {
        const instances = await prisma.game_namex.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<NameXContainer[]> {
        const instances = await prisma.game_namex.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<NameXContainer> {
        const parent = await prisma.game_namex.findUnique({ where: { id: gameId } })
        const container = <NameXContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            goal: parent!!.goal,
            title: parent!!.title,
            context: parent!!.context
        }

        if(parent!!.type === 'artist') {
            const artistIds = JSON.parse(parent!!.items) as string[]
            const artistData = await prisma.artist.findMany({ where: { id: { in: artistIds } } })
            const artists = artistIds.map(id => artistData.find(a => a.id === id) ?? new FlatArtist("-1", "<invalid>")).map(FlatArtist.fromJson)

            return <NameXContainer>{
                ...container,
                items: { type: 'artist', items: artists },
            }
        } else if(parent!!.type === 'album') {
            const albumIds = JSON.parse(parent!!.items) as string[]
            const albumData = await prisma.album.findMany({ where: { sid: { in: albumIds } } })
            const albums = albumIds.map(sid => albumData.find(a => a.sid === sid)).map(FlatAlbum.fromJson)

            return <NameXContainer>{
                ...container,
                items: { type: 'album', items: albums },
            }
        } else if(parent!!.type === 'track') {
            const trackIds = JSON.parse(parent!!.items) as string[]
            const trackData = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
            const tracks = trackIds.map(sid => trackData.find(a => a.sid === sid)).map(FlatTrack.fromJson)

            return <NameXContainer>{
                ...container,
                items: { type: 'track', items: tracks },
            }
        } else {
            // remaining fallback type: text
            const text = JSON.parse(parent!!.items) as string[]

            return <NameXContainer>{
                ...container,
                items: { type: 'text', items: text }
            }
        }
    }

    override async createInstance(instance: NameXContainer): Promise<NameXContainer> {
        const { type: mappedType, items: mappedItems } = this.stringifyItems(instance)
        const fetched = await prisma.game_namex.create({
            data: {
                created_by: instance.created_by!!,
                title: instance.title,
                goal: instance.goal,
                type: mappedType,
                items: mappedItems,
                context: instance.context
            }
        })
        const { items, ...rest } = fetched

        return <NameXContainer>{
            ...rest,
            items: instance.items
        }
    }

    override async updateInstance(instance: NameXContainer): Promise<NameXContainer> {
        const { type: mappedType, items: mappedItems } = this.stringifyItems(instance)
        const fetched = await prisma.game_namex.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                goal: instance.goal,
                type: mappedType,
                items: mappedItems,
                context: instance.context
            }
        })
        const { items, ...rest } = fetched

        return <NameXContainer>{
            ...rest,
            items: instance.items
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_namex.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
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

    private stringifyItems(instance: NameXContainer): { type: string, items: string } {
        let type: string;
        let items: string;

        if(instance.items.type === 'artist') {
            type = 'artist'
            items = JSON.stringify(instance.items.items.map(a => a.id))
        } else if(instance.items.type === 'album') {
            type = 'album'
            items = JSON.stringify(instance.items.items.map(a => a.sid))
        } else if(instance.items.type === 'track') {
            type = 'track'
            items = JSON.stringify(instance.items.items.map(a => a.sid))
        } else {
            type = 'text'
            items = JSON.stringify(instance.items.items as string[])
        }

        return { type, items }
    }

    private async mapAll(instances: game_namexModel[]): Promise<NameXContainer[]> {
        const artistIds = instances.filter(i => i.type === 'artist').flatMap(i => JSON.parse(i.items) as string[])
        const albumIds = instances.filter(i => i.type === 'album').flatMap(i => JSON.parse(i.items) as string[])
        const trackIds = instances.filter(i => i.type === 'track').flatMap(i => JSON.parse(i.items) as string[])
        const artistData = (await prisma.artist.findMany({ where: { id: { in: artistIds }}}))
        const albumData = (await prisma.album.findMany({ where: { sid: { in: albumIds }}}))
        const trackData = (await prisma.track.findMany({ where: { sid: { in: trackIds }}}))

        return instances.map(parent => {
            const rawItems = JSON.parse(parent!!.items) as string[]
            const container = <NameXContainer>{
                id: parent!!.id,
                created_by: parent!!.created_by,
                goal: parent!!.goal,
                title: parent!!.title,
                context: parent!!.context
            }

            if(parent!!.type === 'artist') {
                const artists = rawItems.map(id => artistData.find(a => a.id === id) ?? new FlatArtist("-1", "<invalid>")).map(FlatArtist.fromJson)

                return <NameXContainer>{
                    ...container,
                    items: { type: 'artist', items: artists },
                }
            } else if(parent!!.type === 'album') {
                const albums = rawItems.map(sid => albumData.find(a => a.sid === sid)).map(FlatAlbum.fromJson)

                return <NameXContainer>{
                    ...container,
                    items: { type: 'album', items: albums },
                }
            } else if(parent!!.type === 'track') {
                const tracks = rawItems.map(sid => trackData.find(a => a.sid === sid)).map(FlatTrack.fromJson)

                return <NameXContainer>{
                    ...container,
                    items: { type: 'track', items: tracks },
                }
            } else {
                // remaining fallback type: text
                return <NameXContainer>{
                    ...container,
                    items: { type: 'text', items: rawItems }
                }
            }
        })
    }
}