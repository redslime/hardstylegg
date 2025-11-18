import type {ArtworkContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import {join} from "pathe";
import {unlink} from "node:fs/promises";
import type {ReportItem} from "~/types/models";

export class ServerArtworkGame extends ServerGameDef<ArtworkContainer> {

    constructor() {
        super(GAME_METAS.Artwork);
    }

    override async fetchAllInstances(user: User): Promise<ArtworkContainer[]> {
        const instances = await prisma.game_artwork.findMany(this.whereAdminOrCreator(user))
        const trackIds = instances.map(i => i.track_id)
        const tracks = await prisma.track.findMany({
            where: {
                sid: {
                    in: trackIds
                }
            }
        })
        return instances.map(i => {
            return <ArtworkContainer>{
                id: i.id,
                created_by: i.created_by,
                artwork_blank: i.artwork_blank,
                track: tracks.find(t => t.sid === i.track_id),
            }
        })
    }

    override async fetchInstance(gameId: number): Promise<ArtworkContainer> {
        const parent = await prisma.game_artwork.findUnique({ where: { id: gameId } })
        const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })

        return <ArtworkContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            track: track,
            artwork_blank: parent!!.artwork_blank
        }
    }

    override async createInstance(instance: ArtworkContainer): Promise<ArtworkContainer> {
        const fetched = await prisma.game_artwork.create({
            data: {
                created_by: instance.created_by!!,
                track_id: instance.track.sid,
                artwork_blank: instance.artwork_blank
            }
        })
        const { track_id, ...rest } = fetched
        return <ArtworkContainer>{
            ...rest,
            track: instance.track
        }
    }

    override async updateInstance(instance: ArtworkContainer): Promise<ArtworkContainer> {
        const fetched = await prisma.game_artwork.update({
            where: {id: instance.id},
            data: {
                track_id: instance.track.sid,
                artwork_blank: instance.artwork_blank
            }
        })
        const {track_id, ...rest} = fetched
        return <ArtworkContainer>{
            ...rest,
            track: instance.track
        }
    }

    override async deleteInstance(gameId: number): Promise<any> {
        const deleted = await prisma.game_artwork.delete(this.whereGameId(gameId))
        const imgPath = join(process.cwd(), 'data', 'artwork', deleted.artwork_blank + '.png')
        await unlink(imgPath)
        return deleted
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }
}