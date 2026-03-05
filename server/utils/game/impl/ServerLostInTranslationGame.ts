import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {LostInTranslationContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import type {game_lost_in_translationModel, trackModel} from "~/generated/prisma/models";
import type {ReportItem} from "~/types/models";

export class ServerLostInTranslationGame extends ServerGameDef<LostInTranslationContainer> {

    constructor() {
        super(GAME_METAS.LostInTranslation);
    }

    override async fetchAllInstances(user: User): Promise<LostInTranslationContainer[]> {
        const instances = await prisma.game_lost_in_translation.findMany(this.whereAdminOrCreator(user))
        return await this.mapAll(instances)
    }

    override async fetchInstances(ids: number[]): Promise<LostInTranslationContainer[]> {
        const instances = await prisma.game_lost_in_translation.findMany(this.whereIdIn(ids))
        return await this.mapAll(instances)
    }

    override async fetchInstance(gameId: number): Promise<LostInTranslationContainer> {
        const instance = await prisma.game_lost_in_translation.findUnique({ where: { id: gameId } })
        const track = await prisma.track.findUnique({ where: { sid: instance!!.track_id } })
        return this.map(instance!!, track!!)
    }

    override async createInstance(instance: LostInTranslationContainer): Promise<LostInTranslationContainer> {
        return this.map(await prisma.game_lost_in_translation.create({
            data: {
                created_by: instance.created_by!!,
                track_id: instance.track.sid,
                original_text: instance.textOriginal.trim(),
                translated_text: instance.textTranslated.trim(),
                translation_chain: instance.translationChain.trim(),
                context: instance.context
            }
        }), instance.track)
    }

    override async updateInstance(instance: LostInTranslationContainer): Promise<LostInTranslationContainer> {
        return this.map(await prisma.game_lost_in_translation.update({
            where: { id: instance.id },
            data: {
                track_id: instance.track.sid,
                original_text: instance.textOriginal.trim(),
                translated_text: instance.textTranslated.trim(),
                translation_chain: instance.translationChain.trim(),
                context: instance.context
            }
        }), instance.track)
    }

    override async deleteInstance(gameId: number, user: User): Promise<boolean> {
        const deleted = await prisma.game_lost_in_translation.delete(this.whereGameIdAndAdminOrCreator(gameId, user))
        return gameId === deleted.id
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />';
    }

    override async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return this.respondAttempts(reportItem)
    }

    override async getExistingTracks(): Promise<string[]> {
        const recs = await prisma.game_lost_in_translation.findMany({
            select: {
                track_id: true
            }
        })
        return recs.map(r => r.track_id)
    }

    map(i: game_lost_in_translationModel, track: trackModel): LostInTranslationContainer {
        return <LostInTranslationContainer>{
            id: i.id,
            created_by: i.created_by,
            context: i.context,
            track,
            textTranslated: i.translated_text,
            textOriginal: i.original_text,
            translationChain: i.translation_chain
        }
    }

    async mapAll(instances: game_lost_in_translationModel[]): Promise<LostInTranslationContainer[]> {
        const trackIds = instances.map(i => i.track_id)
        const tracks = await prisma.track.findMany({
            where: {
                sid: {
                    in: trackIds
                }
            }
        })
        return instances.map(i => this.map(i, tracks.find(t => t.sid === i.track_id)!!))
    }
}