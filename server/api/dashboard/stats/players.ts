import prisma from "~/lib/prisma";
import {getDayIdToday, getFriendlyName} from "~/server/utils/schedule";

type Response = Record<number, { dayFriendly: string, played: number; completed: number; onApp: number; }>
let cache: Response | null = null

export function resetCache() {
    cache = null
}

export default defineEventHandler(async (event) => {
    if(cache) return cache

    const { user } = await requireUserSession(event)
    const rangeStart = getDayIdToday() - 14
    const rangeEnd = getDayIdToday() - 1
    const reports = await prisma.report.findMany({
        where: {
            dayId: {
                gte: rangeStart,
                lte: rangeEnd
            }
        }
    })
    cache = reports.reduce((acc, r) => {
        if (!acc[r.dayId]) {
            acc[r.dayId] = {dayFriendly: getFriendlyName(r.dayId), played: 0, completed: 0, onApp: 0}
        }

        acc[r.dayId]!!.played += 1
        acc[r.dayId]!!.completed += r.completed ? 1 : 0
        acc[r.dayId]!!.onApp += r.app ? 1 : 0

        return acc
    }, {} as Response)

    return cache
})