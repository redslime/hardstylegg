import type {Track} from "~/types/models";
import type {ZoomerImageData, ZoomerType} from "~/types/zoomerModels";

export type AnyGameContainer = ArtworkContainer | CompleteAlbumContainer | CompleteLyricsContainer | HeardleContainer | NameXContainer | OrderContainer | QuizContainer | TimelineContainer | TimetableContainer | MapContainer | ZoomerContainer
export type AnyGameContainers = AnyGameContainer[]

export interface ArtworkContainer extends EditorContainer {
    track: Track
    imgName: string
    img64?: string // only used during creation
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
    context: string | null
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
    context: string | null
}

export interface QuizContainer extends EditorContainer {
    title: string
    items: QuizAnswer[]
}

export interface QuizAnswer extends EditorContainer {
    tempId?: number
    text: string
    correct: boolean
    context: string | null
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
    context: string | null
}

export interface MapContainer extends EditorContainer {
    title: string
    goal: string
}

export interface ZoomerContainer extends EditorContainer {
    title: string
    goal: ZoomerType
    data: ZoomerImageData
}