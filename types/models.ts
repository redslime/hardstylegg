export interface PackedDayData {
    dayId: number
    dayFriendly: string
    typeIds: number[]
    data: any[]
}

export enum GameState {
    UPCOMING,
    PLAYING,
    SUCCEEDED,
    FAILED
}

export interface Track {
    sid: string
    artists: string
    title: string
    year: number
    cover_art: string
}

export interface ShallowTrack {
    sid: string
    title: string
    artists: string
}

export interface GameContainer {
    dayId: number
    dayFriendly: string
    data: GameData[]
}

export interface GameData {
    name: string
    props: {
        state: GameState
        container: any
    }
}