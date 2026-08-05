import prisma from "~/lib/prisma";
import {getDayIdToday, getFriendlyName} from "~/server/utils/schedule";
import {
    DEFAULT_PLAYER_STATS_RANGE,
    isPlayerStatsRange,
    PLAYER_STATS_RANGES,
    type PlayerStatsContainer,
    type PlayerStatsRange
} from "~/types/playerStats.ts";

let cache: Record<string, PlayerStatsContainer> = {}

export function resetPlayerStatsCache() {
    cache = {}
}

function getDayRangeStart(range: PlayerStatsRange) {
    const daysBack = PLAYER_STATS_RANGES[range].daysBack

    if(daysBack === null) return 1

    return getDayIdToday() - daysBack
}

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const query = getQuery(event)
    const range = isPlayerStatsRange(query.range) ? query.range : DEFAULT_PLAYER_STATS_RANGE

    if(cache[range]) return cache[range]

    const rangeStart = getDayRangeStart(range)
    const rangeEnd = getDayIdToday() - 1
    const reports = await prisma.report.findMany({
        where: {
            dayId: {
                gte: rangeStart,
                lte: rangeEnd
            }
        }
    })
    const reduced = reports.reduce((acc, r) => {
        if (!acc[r.dayId]) {
            acc[r.dayId] = {dayFriendly: getFriendlyName(r.dayId), played: 0, completed: 0, onApp: 0}
        }

        acc[r.dayId]!!.played += 1
        acc[r.dayId]!!.completed += r.completed ? 1 : 0
        acc[r.dayId]!!.onApp += r.app ? 1 : 0

        return acc
    }, {} as PlayerStatsContainer)

    cache[range] = reduced

    return reduced
})