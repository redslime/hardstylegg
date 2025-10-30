import {defineEventHandler, readBody} from "h3";
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {validateCompleteLyrics} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const lyrics = await readBody<CompleteLyricsContainer>(event)
    const errors: string[] = validateCompleteLyrics(lyrics)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!lyrics.id) {
        // create new
        const { track_id, ...rest } = await prisma.game_complete_lyrics.create({
            data: {
                created_by: lyrics.created_by!!,
                text: lyrics.text,
                track_id: lyrics.track.sid
            }
        })
        const track = await prisma.track.findUnique({
            where: { sid: lyrics.track.sid }
        })
        return {
            ...rest,
            track
        }
    } else {
        // update existing
        const { track_id, ...rest } = await prisma.game_complete_lyrics.update({
            where: { id: lyrics.id },
            data: {
                text: lyrics.text,
                track_id: lyrics.track.sid
            }
        })
        const track = await prisma.track.findUnique({
            where: { sid: lyrics.track.sid }
        })
        return {
            ...rest,
            track
        }
    }
})