import {defineEventHandler, readBody} from "h3";
import type {HeardleContainer} from "~/types/gameModels";
import {validateHeardle} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const heardle = await readBody<HeardleContainer>(event)
    const errors: string[] = validateHeardle(heardle)

    if (errors.length > 0) {
        return [...errors]
    }

    if(!heardle.id) {
        // create new
        const fetched = await prisma.game_heardle.create({
            data: {
                created_by: heardle.created_by!!,
                src: heardle.src,
                durations: JSON.stringify(heardle.durations),
                track_id: heardle.track.sid
            }
        })
        const { track_id, durations, ...rest } = fetched
        return <HeardleContainer>{
            ...rest,
            durations: JSON.parse(durations) as number[],
            track: heardle.track
        }
    } else {
        // update existing
        const fetched = await prisma.game_heardle.update({
            where: { id: heardle.id },
            data: {
                src: heardle.src,
                durations: JSON.stringify(heardle.durations),
                track_id: heardle.track.sid
            }
        })
        const { track_id, durations, ...rest } = fetched
        return <HeardleContainer>{
            ...rest,
            durations: JSON.parse(durations) as number[],
            track: heardle.track
        }
    }
})