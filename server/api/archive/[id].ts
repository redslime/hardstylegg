import {getDayIdToday, getPackedDayDataForDay} from "~/server/utils/schedule";
import type {PackedDayData} from "~/types/models";

const cache: PackedDayData[] = []

export default defineEventHandler(async (event) => {
    const dayId = event.context.params?.id;

    if(dayId) {
        if(parseInt(dayId) < getDayIdToday()) {
            setHeader(event, 'Cache-Control', 'public, max-age=648000') // 1 week
            const cached = cache.find(day => day.dayId === parseInt(dayId))

            if(cached) return cached

            const data = await getPackedDayDataForDay(parseInt(dayId))
            cache.push(data)
            return data
        }
    }

    return {}
});