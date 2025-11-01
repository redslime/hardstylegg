import type {DashboardData, ScheduleDay, Track} from "~/types/models";
import type {
    ArtworkContainer,
    CompleteAlbumContainer,
    CompleteLyricsContainer, NameXContainer, OrderContainer,
    QuizContainer,
    TimelineContainer, TimetableContainer
} from "~/types/gameModels";

let dashboardData: DashboardData | null = null;
let tracks: Track[] | null = null;
let albums: Track[] | null = null;
let artworkData: ArtworkContainer[] | null = null;
let completeAlbumData: CompleteAlbumContainer[] | null = null;
let completeLyricsData: CompleteLyricsContainer[] | null = null;
let nameXData: NameXContainer[] | null = null;
let orderData: OrderContainer[] | null = null;
let quizData: QuizContainer[] | null = null;
let timelineData: TimelineContainer[] | null = null;
let timetableData: TimetableContainer[] | null = null;

export async function getDashboardData(): Promise<DashboardData> {
    if(dashboardData !== null) return dashboardData
    dashboardData = await $fetch<DashboardData>('/api/dashboard')
    return dashboardData
}

export async function getDashboardTracks(): Promise<Track[]> {
    if(tracks !== null) return tracks
    tracks = await $fetch<Track[]>('/api/dashboard/tracks')
    return tracks
}

export async function getDashboardAlbums(): Promise<Track[]> {
    if(albums !== null) return albums
    albums = await $fetch<Track[]>('/api/dashboard/albums')
    return albums
}

export async function getArtworkData(): Promise<ArtworkContainer[]> {
    if(artworkData !== null) return artworkData
    artworkData = await $fetch<ArtworkContainer[]>('/api/dashboard/artwork')
    return artworkData
}

export async function getCompleteAlbumData(): Promise<CompleteAlbumContainer[]> {
    if(completeAlbumData !== null) return completeAlbumData
    completeAlbumData = await $fetch<CompleteAlbumContainer[]>('/api/dashboard/complete-album')
    return completeAlbumData
}

export async function getCompleteLyricsData(): Promise<CompleteLyricsContainer[]> {
    if(completeLyricsData !== null) return completeLyricsData
    completeLyricsData = await $fetch<CompleteLyricsContainer[]>('/api/dashboard/complete-lyrics')
    return completeLyricsData
}

export async function getNameXData(): Promise<NameXContainer[]> {
    if(nameXData !== null) return nameXData
    nameXData = await $fetch<NameXContainer[]>('/api/dashboard/name-x')
    return nameXData
}

export async function getOrderData(): Promise<OrderContainer[]> {
    if(orderData !== null) return orderData
    orderData = await $fetch<OrderContainer[]>('/api/dashboard/order')
    return orderData
}

export async function getQuizData(): Promise<QuizContainer[]> {
    if(quizData !== null) return quizData
    quizData = await $fetch<QuizContainer[]>('/api/dashboard/quiz')
    return quizData
}

export async function getTimelineData(): Promise<TimelineContainer[]> {
    if(timelineData !== null) return timelineData
    timelineData = await $fetch<TimelineContainer[]>('/api/dashboard/timeline')
    return timelineData
}

export async function getTimetableData(): Promise<TimetableContainer[]> {
    if(timetableData !== null) return timetableData
    timetableData = await $fetch<TimetableContainer[]>('/api/dashboard/timetable')
    return timetableData
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