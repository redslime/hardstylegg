import type {ArchiveContainer, GameContainer, PackedDayData} from "~/types/models";
import {transform} from "~/utils/game";
import {DateTime} from "luxon";

let todayId: number | null = null
let baseDate: DateTime | null = null

export const archiveGames: GameContainer[] = reactive<GameContainer[]>([])

async function loadData(): Promise<ArchiveContainer> {
    const data = await $fetch<ArchiveContainer>('/api/archive')
    todayId = data.todayId
    baseDate = DateTime.fromISO(data.baseDate.toString())
    data.recentGames.map(transform).forEach(g => archiveGames.push(g))
    return data
}

export async function getYesterdayGame(): Promise<GameContainer> {
    if(todayId === null) {
        todayId = (await loadData()).todayId
    }

    return getArchiveGame(todayId - 1)
}

export async function getDayFriendlyName(dayId: number, format: string = 'LLL d'): Promise<string> {
    if(baseDate === null) {
        baseDate = (await loadData()).baseDate
    }

    const nextDay = baseDate.plus({ days: dayId - 1 });
    return nextDay.toFormat(format);
}

export async function getArchiveGame(dayId: number): Promise<GameContainer> {
    const cached = archiveGames.find(g => g.dayId === dayId)

    if(cached) return cached

    const data = await $fetch<PackedDayData>(`/api/archive/${dayId}`)
    const transformed = transform(data)
    archiveGames.push(transformed)
    archiveGames.sort((a, b) => b.dayId - a.dayId)
    return transformed
}

function getCachedGame(dayId: number): GameContainer | undefined {
    return archiveGames.find(g => g.dayId === dayId)
}

export function getNextArchiveGames(dayId: number): GameContainer[] {
    return [getCachedGame(dayId-1), getCachedGame(dayId), getCachedGame(dayId+1)].filter(g => g !== undefined)
}