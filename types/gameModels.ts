import type {Track} from "~/types/models";

export interface ArtworkContainer {
    id?: number
    created_by?: number
    track: Track
    artwork_blank: string
}

export interface CompleteAlbumContainer {
    id?: number
    created_by?: number
    album: Track | null
    items: CompleteAlbumItem[]
}

export interface CompleteAlbumItem {
    id?: number
    parent_id?: number
    name: string
    artist: string
    hidden: boolean
    guess?: string
    correct?: boolean | null
}

export interface CompleteLyricsContainer {
    id?: number
    created_by?: number
    text: string
    track: Track
}

export interface HeardleContainer {
    id?: number
    created_by?: number
    track: Track
    src: string
    durations: number[]
}

export interface NameXContainer {
    id?: number
    created_by?: number
    goal: number
    title: string
    items: Track[]
}

export interface OrderContainer {
    id?: number
    created_by?: number
    title: string
    showNames: boolean
    items: OrderItem[]
}

export interface OrderItem {
    parent_id?: number
    index: number
    track: Track
}

export interface QuizContainer {
    id?: number
    created_by?: number
    title: string
    items: QuizAnswer[]
}

export interface QuizAnswer {
    id?: number
    parent_id?: number
    text: string
    correct: boolean
}

export interface TimelineContainer {
    id?: number
    created_by?: number
    title: string
    goal: number
}

export interface TimetableContainer {
    id?: number
    created_by?: number
    title: string
    color_bg: string
    color_text: string
    items: TimetableItem[]
}

export interface TimetableItem {
    id?: number
    parent_id?: number
    name: string
    begin: string
    end: string
    hidden: boolean
    guess?: string
    correct?: boolean | null
}