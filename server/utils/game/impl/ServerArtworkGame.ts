import type {ArtworkContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import {join} from "pathe";
import {unlink} from "node:fs/promises";
import type {ReportItem} from "~/types/models";
import {decodeBase64Image, validateWebPBuffer} from "~/utils/image";
import {writeFile} from "fs/promises";

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
                imgName: i.artwork_blank,
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
            imgName: parent!!.artwork_blank
        }
    }

    override async createInstance(instance: ArtworkContainer): Promise<ArtworkContainer> {
        if(!instance.img64) {
            throw createError({ statusCode: 400, message: "Missing image data" })
        }

        // write image to file
        const imgName = crypto.randomUUID()
        const path = join(process.cwd(), 'data', 'artwork', imgName + '.webp')
        const buffer = decodeBase64Image(instance.img64)

        validateWebPBuffer(buffer)
        await writeFile(path, buffer)
        instance.img64 = undefined
        instance.imgName = imgName

        const fetched = await prisma.game_artwork.create({
            data: {
                created_by: instance.created_by!!,
                track_id: instance.track.sid,
                artwork_blank: instance.imgName
            }
        })
        const { track_id, artwork_blank, ...rest } = fetched
        return <ArtworkContainer>{
            ...rest,
            imgName: artwork_blank,
            track: instance.track
        }
    }

    override async updateInstance(instance: ArtworkContainer): Promise<ArtworkContainer> {
        const fetched = await prisma.game_artwork.update({
            where: {id: instance.id},
            data: {
                track_id: instance.track.sid,
            }
        })
        const {track_id, artwork_blank, ...rest} = fetched
        return <ArtworkContainer>{
            ...rest,
            track: instance.track
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_artwork.delete(this.whereGameIdAndAdminOrCreator(gameId, user))

        if(gameId === deleted.id) {
            const imgPath = join(process.cwd(), 'data', 'artwork', deleted.artwork_blank + '.webp')
            await unlink(imgPath)
            return true
        }

        return false
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }
}