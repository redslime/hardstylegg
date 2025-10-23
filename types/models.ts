export interface PackedDayData {
    dayId: number
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

export interface GameContainer {
    dayId: number
    data: GameData[]
}

export interface GameData {
    name: string
    props: {
        state: GameState
        container: any
    }
}