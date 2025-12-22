import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {ZoomerContainer} from "~/types/gameModels";
import type {ReportItem} from "~/types/models";
import type {User} from "#auth-utils";
import type {Artist, Festival, ZoomerImageData, ZoomerType} from "~/types/zoomerModels";
import {GAME_METAS} from "#shared/games";
import prisma from "~/lib/prisma";
import {join} from "pathe";
import {mkdir, writeFile} from "fs/promises";
import {decodeBase64Image, validateWebPBuffer} from "~/utils/image";
import {unlink} from "node:fs/promises";

export class ServerZoomerGame extends ServerGameDef<ZoomerContainer> {

    constructor() {
        super(GAME_METAS.Zoomer);
    }

    private serializeType(goal: string): ZoomerType {
        const parts = goal.split(":");

        if(goal.startsWith("artist")) {
            return <Artist>{
                id: "artist",
                name: parts[1]
            }
        } else if(goal.startsWith("festival")) {
            // example: 'festival:defqon.1:2024:stage=Red'

            if(parts.length === 4) {
                const name = parts[1]!!
                const year = parseInt(parts[2]!!)
                const fields: Record<string, string> = {}

                parts[3]!!.split(",").forEach((part) => {
                    const kv = part.split("=")
                    fields[kv[0]!!] = kv[1]!!
                })

                return <Festival>{
                    id: "festival",
                    name,
                    years: year,
                    fields
                }
            }
        }

        return <Artist>{
            name: "invalid"
        }
    }

    private deserializeType(type: ZoomerType): string {
        if(type.id === "artist") {
            return "artist:" + type.name
        } else if(type.id === "festival") {
            const name = type.name
            const year = type.years as number
            const fields = Object.entries(type.fields ?? {}).map(([k, v]) => `${k}=${v}`)
            return `festival:${name}:${year}:${fields.join(",")}`
        }

        return "invalid"
    }

    private mapRecord(rec: {
        id: number
        created_by: number
        title: string
        goal: string
        data: string
    }): ZoomerContainer {
        return <ZoomerContainer>{
            id: rec!!.id,
            created_by: rec!!.created_by!!,
            title: rec!!.title,
            goal: this.serializeType(rec!!.goal),
            data: JSON.parse(rec!!.data) as ZoomerImageData,
        }
    }

    override async fetchAllInstances(user: User): Promise<ZoomerContainer[]> {
        const instances = await prisma.game_zoomer.findMany(this.whereAdminOrCreator(user))
        return instances.map(i => this.mapRecord(i))
    }

    override async fetchInstance(gameId: number): Promise<ZoomerContainer> {
        const i = await prisma.game_zoomer.findUnique({ where: { id: gameId } })
        return this.mapRecord(i!!)
    }

    override async createInstance(instance: ZoomerContainer): Promise<ZoomerContainer> {
        const { img64, ...rest } = instance.data

        if(!img64) {
            throw createError({ statusCode: 400, message: "Missing image data" })
        }

        // write image to file
        const imgName = crypto.randomUUID()
        const path = join(process.cwd(), 'data', 'zoomer', imgName + '.webp')
        const buffer = decodeBase64Image(img64)

        validateWebPBuffer(buffer)
        await mkdir(join(process.cwd(), 'data', 'zoomer'), { recursive: true })
        await writeFile(path, buffer)
        rest.imgName = imgName

        const created = await prisma.game_zoomer.create({
            data: {
                created_by: instance.created_by!!,
                title: instance.title,
                goal: this.deserializeType(instance.goal),
                data: JSON.stringify(rest),
            }
        })

        return <ZoomerContainer>{
            id: created.id,
            created_by: created.created_by,
            title: instance.title,
            goal: instance.goal,
            data: rest
        }
    }

    override async updateInstance(instance: ZoomerContainer): Promise<ZoomerContainer> {
        const updated = await prisma.game_zoomer.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                goal: this.deserializeType(instance.goal),
                data: JSON.stringify(instance.data),
            }
        })

        return <ZoomerContainer>{
            id: updated.id,
            created_by: updated.created_by,
            title: updated.title,
            goal: instance.goal,
            data: instance.data
        }
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_zoomer.delete(this.whereGameIdAndAdminOrCreator(gameId, user))

        if(gameId === deleted.id) {
            const record = this.mapRecord(deleted)
            const path = join(process.cwd(), 'data', 'zoomer', record.data.imgName!! + '.webp')
            await unlink(path)
            return true
        }

        return false
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }
}