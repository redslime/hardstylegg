import type {DashboardData, List, ScheduleDay} from "~/types/models";
import {DateTime} from "luxon";
import {getCacheParam} from "~/utils/cacheKeys";
import {remapList, RichAlbum, RichArtist, RichTrack} from "~/types/content";

export const GAMES_PER_DAY = 5

let dashboardData: DashboardData | null = null;
let tracks: RichTrack[] | null = null;
let albums: RichAlbum[] | null = null;
let artists: RichArtist[] | null = null;
let lists: List[] | null = null;

export async function getDashboardData(): Promise<DashboardData> {
    if(dashboardData !== null) return dashboardData
    dashboardData = await $fetch<DashboardData>('/api/dashboard')
    return dashboardData
}

export async function getDashboardTracks(skipHidden: boolean = false): Promise<RichTrack[]> {
    if(tracks !== null) return tracks
    const v = await getCacheParam("tracks")
    tracks = (await $fetch<RichTrack[]>('/api/dashboard/content/tracks' + v)).map(RichTrack.fromJson)

    if(skipHidden) {
        return tracks.filter(t => !t.hidden)
    } else {
        return tracks
    }
}

export function updateDashboardTrack(track: RichTrack) {
    if(tracks !== null) {
        const index = tracks.findIndex(t => t.sid === track.sid)
        if(index !== -1) tracks.splice(index, 1)
        tracks.push(track)
    }
}

export async function getDashboardAlbums(skipHidden: boolean = false): Promise<RichAlbum[]> {
    if(albums !== null) return albums
    const v = await getCacheParam("albums")
    albums = (await $fetch<RichAlbum[]>('/api/dashboard/content/albums' + v)).map(RichAlbum.fromJson)

    if(skipHidden) {
        return albums.filter(t => !t.hidden)
    } else {
        return albums
    }
}

export function updateDashboardAlbum(album: RichAlbum) {
    if(albums !== null) {
        const index = albums.findIndex(t => t.sid === album.sid)
        if(index !== -1) albums.splice(index, 1)
        albums.push(album)
    }
}

export async function getDashboardArtists(): Promise<RichArtist[]> {
    if(artists !== null) return artists
    const v = await getCacheParam("artists")
    artists = (await $fetch<RichArtist[]>('/api/dashboard/content/artists' + v)).map(RichArtist.fromJson)
    return artists
}

export function updateDashboardArtist(artist: RichArtist) {
    if(artists !== null) {
        const index = artists.findIndex(a => a.id === artist.id)
        if(index !== -1) artists.splice(index, 1)
        artists.push(artist)
    }
    if(tracks !== null) {
        tracks.filter(t => t.artists.map(a => a.id).includes(artist.id))
            .forEach(t => t.artists.filter(a => a.id === artist.id).forEach(m => m.name = artist.name))
    }
    if(albums !== null) {
        albums.filter(a => a.artists.map(a => a.id).includes(artist.id))
            .forEach(a => a.artists.filter(a => a.id === artist.id).forEach(m => m.name = artist.name))
    }
}

export async function getDashboardLists(): Promise<List[]> {
    if(lists !== null) return lists
    const v = await getCacheParam("lists")
    lists = (await $fetch<List[]>('/api/dashboard/list' + v)).map(remapList)
    return lists
}

export function updateDashboardList(list: List) {
    if(lists !== null) {
        const index = lists.findIndex(l => l.id === list.id)
        if(index !== -1) lists.splice(index, 1)
        lists.push(list)
        lists.sort((a, b) => a.id - b.id)
    }
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

export function deleteTrack(track: RichTrack) {
    tracks?.splice(tracks.indexOf(track), 1)
}

export function deleteAlbum(album: RichAlbum) {
    albums?.splice(albums.indexOf(album), 1)
}

export function getLastPlayedDelta(typeId: number): number | undefined {
    const lastDay = dashboardData?.schedule?.days?.findLast(d => d.typeIds.includes(typeId))

    if(lastDay && dashboardData?.schedule?.todayId) {
        return dashboardData.schedule.todayId - lastDay.day
    }
}