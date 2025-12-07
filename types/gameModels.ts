import type {Track} from "~/types/models";

export type AnyGameContainer = ArtworkContainer | CompleteAlbumContainer | CompleteLyricsContainer | HeardleContainer | NameXContainer | OrderContainer | QuizContainer | TimelineContainer | TimetableContainer | MapContainer
export type AnyGameContainers = AnyGameContainer[]

export interface ArtworkContainer extends EditorContainer {
    track: Track
    artwork_blank: string
    blankFile?: File
    uploadedName?: string
}

export interface CompleteAlbumContainer extends EditorContainer {
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

export interface CompleteLyricsContainer extends EditorContainer {
    text: string
    track: Track
}

export interface HeardleContainer extends EditorContainer {
    track: Track
    src: string
    durations: number[]
    tempFile?: File
    previewUrl?: string
}

export interface NameXContainer extends EditorContainer {
    goal: number
    title: string
    tracks: boolean
    items: Track[] | string[]
}

export interface OrderContainer extends EditorContainer {
    title: string
    showNames: boolean
    items: OrderItem[]
}

export interface OrderItem {
    parent_id?: number
    index: number
    track: Track
}

export interface QuizContainer extends EditorContainer {
    title: string
    items: QuizAnswer[]
}

export interface QuizAnswer extends EditorContainer {
    text: string
    correct: boolean
}

export interface TimelineContainer extends EditorContainer {
    title: string
    goal: number
}

export interface TimetableContainer extends EditorContainer {
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

export interface MapContainer extends EditorContainer {
    title: string
    goal: string
}