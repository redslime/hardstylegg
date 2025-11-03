import {defineEventHandler, readBody} from "h3";
import type {ScheduleDay} from "~/types/models";
import prisma from "~/lib/prisma";
import {getDayIdToday} from "~/server/utils/schedule";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const schedule = await readBody<ScheduleDay>(event)

    if(schedule.typeIds.length !== schedule.gameIds.length) {
        return createError({
            statusCode: 400,
            statusMessage: "Type and game ids must be the same length"
        })
    }

    if(schedule.day > getDayIdToday()) {
        // only allow updating future entries
        return await prisma.day_schedule.upsert({
            where: {
                day: schedule.day
            },
            update: {
                type_ids: JSON.stringify(schedule.typeIds),
                game_ids: JSON.stringify(schedule.gameIds)
            },
            create: {
                day: schedule.day,
                type_ids: JSON.stringify(schedule.typeIds),
                game_ids: JSON.stringify(schedule.gameIds)
            }
        })
    } else {
        return createError({
            statusCode: 400,
            statusMessage: "Only allowed to update future days"
        })
    }
})