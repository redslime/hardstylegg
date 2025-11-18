import type {DashboardData, ScheduleDay, Track} from "~/types/models";
import {DateTime} from "luxon";
import {getAlbumCacheParam, getTrackCacheParam} from "~/utils/cacheKeys";

export const GAMES_PER_DAY = 5

let dashboardData: DashboardData | null = null;
let tracks: Track[] | null = null;
let albums: Track[] | null = null;

export async function getDashboardData(): Promise<DashboardData> {
    if(dashboardData !== null) return dashboardData
    dashboardData = await $fetch<DashboardData>('/api/dashboard')
    return dashboardData
}

export async function getDashboardTracks(): Promise<Track[]> {
    if(tracks !== null) return tracks
    const v = await getTrackCacheParam()
    tracks = await $fetch<Track[]>('/api/dashboard/tracks' + v)
    return tracks
}

export async function getDashboardAlbums(): Promise<Track[]> {
    if(albums !== null) return albums
    const v = await getAlbumCacheParam()
    albums = await $fetch<Track[]>('/api/dashboard/albums' + v)
    return albums
}

export function getScheduleForGame(typeId: number, gameId: number | undefined): ScheduleDay | undefined {
    if(gameId === undefined) return undefined

    return dashboardData?.schedule?.days?.find(day => {
        const typeIds = day.typeIds
        const gameIds = day.gameIds

        if (typeIds.length === gameIds.length) {
            for (let i = 0; i < gameIds.length; i++) {
                const tid = typeIds[i]
                const gid = gameIds[i]

                if (typeId === tid && gameId === gid) {
                    return day
                }
            }
        }
    })
}

export async function getFriendlyName(dayId: number, format: string = 'LLL d'): Promise<string> {
    const schedule = (await getDashboardData()).schedule
    const baseDate: DateTime = DateTime.fromISO(schedule.baseDate.toString())
    const nextDay = baseDate.plus({ days: dayId - 1 });
    return nextDay.toFormat(format);
}

export async function updateScheduleDay(day: ScheduleDay) {
    const schedule = (await getDashboardData()).schedule
    const scheduledDay = schedule.days.find(d => d.day === day.day)

    if(scheduledDay) {
        scheduledDay.typeIds = day.typeIds
        scheduledDay.gameIds = day.gameIds
    } else {
        schedule.days.push(day)
        schedule.days.sort((a, b) => a.day - b.day)
    }

    await $fetch("/api/dashboard/edit/schedule", {
        method: "POST",
        body: day
    })
}

export function deleteTrack(track: Track) {
    tracks?.splice(tracks.indexOf(track), 1)
}

export function deleteAlbum(album: Track) {
    albums?.splice(albums.indexOf(album), 1)
}