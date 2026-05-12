import type {DateTime} from "luxon";
import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {AnyGameContainer} from "~/types/gameModels";

export interface PackedDayData {
    dayId: number
    dayFriendly: string
    typeIds: number[]
    editors: string
    data: any[]
    theme?: string | null
}

export enum GameState {
    UPCOMING,
    PLAYING,
    SUCCEEDED,
    FAILED
}

export enum GameEnvironment {
    DAILY,
    ARCHIVE,
    INFINITY
}

export interface GameContainer {
    dayId: number
    dayFriendly: string
    theme?: string | null
    editors: string
    data: GameData[]
}

export interface GameData {
    name: string
    props: {
        state: GameState
        position: number
        container: any
    }
}

export interface Editor {
    id: number
    discord_id: string
    name: string
    admin: boolean
}

export interface Schedule {
    baseDate: DateTime
    todayId: number
    todayFriendly: string
    midnightTimer: number
    days: ScheduleDay[]
}

export interface ScheduleDay {
    dayFriendly: string
    day: number
    typeIds: number[]
    gameIds: number[]
    theme?: string | null
}

export interface ScheduleEntry {
    typeId: number | undefined
    gameDef: ClientGameDef<AnyGameContainer> | undefined
    gameData: AnyGameContainer | undefined
}

export interface DashboardData {
    groups: DashboardGroup[]
    editors: Editor[]
    schedule: Schedule
    reports: DashboardReportData
}

export interface DashboardReportData {
    timesPlayed: number
    completionRate: number
    avgScore: number
    games: { typeId: number, gameId: number, percent: number }[]
}

export interface DashboardGroup {
    name: string
    items: DashboardItem[]
}

export interface DashboardItem {
    name: string
    icon: string
    url: string
    children?: DashboardItem[]
}

export interface ReportContainer {
    code: string
    dayId: number
    dayFriendly: string
    successes: number
    completed: boolean
    isApp: boolean
    data: GameReport[]
}

export interface GameReport {
    typeId: number
    gameId: number
    success: boolean
    attempts?: number
    itemsCompleted?: Record<number, boolean>
    itemsClicked?: number[]
    custom?: string
}

export interface GameReportFlat {
    success: boolean
    attempts?: number
    itemsCompleted: Record<number, boolean>
    itemsClicked: number[]
    custom?: string
}

export interface CookieDayMemory {
    day: number
    data: boolean[]
}

export interface CookieLastReportMemory {
    dayId: number
    shareCode: string
    reports: GameReport[]
}

export interface CookieStreakMemory {
    streak: number
    lastDayId: number
}

export interface KeyCache {
    tracks: string
    albums: string
    artists: string
}

export interface ReportItem {
    parent_code: string
    typeId: number
    gameId: number
    success: boolean
    attempts: number | null
    items_completed: string | null
    items_clicked: string | null
}

export interface AvgScoresContainer {
    dayIds: number[]
    dayNames: string[]
    avg: number[]
}

export interface ArchiveContainer {
    baseDate: DateTime
    todayId: number
    recentGames: PackedDayData[]
}

export interface InfinityPreviewContainer {
    games: Record<number, number>,
    trackYears: Record<number, {year: number, count: number}[]>
}

export interface InfinityRequestContainer {
    typeIds: number[]
    shared: boolean
    startYear: number
    endYear: number
    typeLimits?: Record<number, number>
}

export interface InfinityResponseContainer {
    typeIds: number[]
    gameData: EditorContainer[]
    shareCode?: string | null
}

export enum StateFilter {
    ALL = "All",
    UNUSED = "Unused",
    UPCOMING = "Upcoming",
    PAST = "Past"
}

export enum SortMode {
    ID = "Creation date",
    SCHEDULE = "Schedule date"
}

export interface InboxSlice {
    totalCount: number
    itemCount: number
    offset: number
    items: Record<string, InboxItem[]>
}

export type InboxItem = InboxAlbum | InboxTrack

export interface InboxAlbum {
    sid: string
    artists: InboxArtist[]
    tracks: InboxTrack[]
    title: string
    date: Date
    cover_art: string
    hidden: boolean
}

export interface InboxTrack {
    sid: string
    artists: InboxArtist[]
    title: string
    date: Date
    cover_art: string
    hidden: boolean
}

export interface InboxArtist {
    id: string
    name: string
}