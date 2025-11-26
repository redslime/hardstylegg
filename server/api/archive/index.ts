import {getBaseDate, getDayIdToday, getPackedDayDataForDay} from "~/server/utils/schedule";
import type {ArchiveContainer, PackedDayData} from "~/types/models";

const PRELOADED_DAYS = 5
let cache: ArchiveContainer | null = null

export function resetArchiveCache() {
    cache = null
}

export default defineEventHandler(async (event) => {
    if(cache) return cache

    const baseDate = getBaseDate()
    const todayId = getDayIdToday()
    const gameData: PackedDayData[] = []

    for(let i = 0; i < PRELOADED_DAYS; i++) {
        const dayId = todayId - i - 1
        const data = await getPackedDayDataForDay(dayId)
        gameData.push(data)
    }

    const container = <ArchiveContainer>{
        baseDate,
        todayId,
        recentGames: gameData
    }
    cache = container
    return container
})