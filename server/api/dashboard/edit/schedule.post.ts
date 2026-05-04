import {defineEventHandler, readBody} from "h3";
import type {ScheduleDay} from "~/types/models";
import prisma from "~/lib/prisma";
import {getDayIdToday, refreshGameData} from "~/server/utils/schedule";
import {GAMES_PER_DAY} from "~/utils/dashboard";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const schedule = await readBody<ScheduleDay>(event)
    let editAnyway = false

    if(schedule.typeIds.length !== schedule.gameIds.length) {
        console.log(schedule)
        return createError({
            statusCode: 400,
            statusMessage: "Type and game ids must be the same length"
        })
    }

    if(schedule.day === getDayIdToday()) {
        // editing today is allowed if there are not enough games yet
        const fetched = await prisma.day_schedule.findUnique({
            where: { day: schedule.day },
            select: { game_ids: true }
        })

        if(fetched) {
            const ids = JSON.parse(fetched.game_ids) as number[]

            if(ids.length < GAMES_PER_DAY) {
                editAnyway = true
            }
        } else {
            // no schedule data at all yet!
            editAnyway = true
        }
    }

    if(schedule.day > getDayIdToday() || editAnyway) {
        // only allow updating future entries
        const fetched = await prisma.day_schedule.upsert({
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

        if(editAnyway) {
            // todays schedule was edited, make sure we refresh the cache
            await refreshGameData()
        }

        return fetched
    } else {
        return createError({
            statusCode: 400,
            statusMessage: "Only allowed to update future days"
        })
    }
})