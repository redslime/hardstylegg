import {DateTime} from 'luxon';
import prisma from "~/lib/prisma";
import {getGameInstance} from "~/server/utils/games";
import type {PackedDayData} from "~/types/models";

const BASE_DATE = DateTime.fromISO('2025-11-03', { zone: 'Europe/Berlin' });

let lastKnownDayId: number | null = null;
let packedCache: PackedDayData | null = null

export function getTimeUntilMidnight(): number {
    const now = DateTime.now().setZone('Europe/Berlin');
    const midnight = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).plus({ days: 1 });
    const diff = midnight.diff(now, 'seconds');
    return Math.floor(diff.seconds);
}

export function getBaseDate(): DateTime {
    return BASE_DATE
}

export function getFriendlyName(dayId: number): string {
    const date = BASE_DATE.plus({ days: dayId - 1 });
    return date.toFormat('LLL d');
}

export async function getPackedDayData(): Promise<PackedDayData> {
    await checkDay()
    return packedCache ?? {
        dayId: -1,
        dayFriendly: "",
        typeIds: [],
        data: []
    }
}

export async function getTypeIdsForDay(dayId: number): Promise<number[]> {
    if(dayId === packedCache?.dayId) {
        return packedCache?.typeIds ?? []
    }

    const typeIds = await prisma.day_schedule.findUnique({
        where: {
            day: dayId
        }
    })

    if(typeIds) {
        return JSON.parse(typeIds.type_ids) as number[]
    }

    return []
}

export function getDayIdToday(): number {
    const now = DateTime.now().setZone('Europe/Berlin');
    return getDayId(now.toJSDate())
}

/**
 * Calculates the day ID relative to the base date (day 1 = base date).
 * @param dateInput - Any date (Date or string)
 */
export function getDayId(dateInput: Date | string): number {
    const date = DateTime.fromJSDate(new Date(dateInput)).setZone('Europe/Berlin');
    const diff = Math.floor(date.diff(BASE_DATE, 'days').days);
    return diff + 1;
}

/**
 * Checks if the current Berlin day has changed since last check.
 * If it has, triggers `onNewDay()` once.
 */
export async function checkDay() {
    const currentDayId = getDayIdToday()

    if (lastKnownDayId === null) {
        // First run
        console.log(`[DayManager] New day detected: ${currentDayId}. Loading...`);
        lastKnownDayId = currentDayId;
        await onNewDay(currentDayId);
        console.log(`[DayManager] Initialized on day ${currentDayId}: ${packedCache?.typeIds}`);
        return;
    }

    if (currentDayId !== lastKnownDayId) {
        console.log(`[DayManager] New day detected! ${lastKnownDayId}. Loading...`);
        lastKnownDayId = currentDayId;
        await onNewDay(currentDayId);
        console.log(`[DayManager] Updated to day ${currentDayId}: ${packedCache?.typeIds}`);
    }
}

export async function getPackedDayDataForDay(dayId: number): Promise<PackedDayData> {
    const data = await prisma.day_schedule.findUnique({
        where: {
            day: dayId
        }
    })
    if(data) {
        const dayId = data.day
        const typeIds = JSON.parse(data.type_ids) as number[]
        const gameIds = JSON.parse(data.game_ids) as number[]

        const packed = []

        if (typeIds.length === gameIds.length) {
            for (let i = 0; i < gameIds.length; i++) {
                const type_id = typeIds[i]
                const instance_id = gameIds[i]

                if(type_id && instance_id) {
                    packed.push(await getGameInstance(prisma, type_id, instance_id))
                }
            }
        }

        return {
            dayId,
            dayFriendly: getFriendlyName(dayId),
            typeIds,
            data: packed
        }
    } else {
        return {
            dayId: -1,
            dayFriendly: getFriendlyName(dayId),
            typeIds: [],
            data: []
        }
    }
}

async function onNewDay(newDayId: number) {
    packedCache = await getPackedDayDataForDay(newDayId)
}
