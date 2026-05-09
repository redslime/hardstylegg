import type {ZoomerImageData, ZoomerType} from "~/types/zoomerModels";
import {FlatAlbum, FlatArtist, FlatTrack, RichArtist, RichTrack} from "~/types/content";

export type AnyGameContainer = ArtworkContainer | CompleteAlbumContainer | CompleteLyricsContainer | HeardleContainer
    | NameXContainer | OrderContainer | QuizContainer | TimelineContainer | TimetableContainer | MapContainer
    | ZoomerContainer | LostInTranslationContainer | WordleContainer | NavigatorContainer | PuzzleContainer
export type AnyGameContainers = AnyGameContainer[]

export interface ArtworkContainer extends EditorContainer {
    track: FlatTrack
    imgName: string
    img64?: string // only used during creation
}

export interface CompleteAlbumContainer extends EditorContainer {
    album: FlatAlbum | null
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
    track: FlatTrack
}

export interface HeardleContainer extends EditorContainer {
    track: FlatTrack
    src: string
    durations: number[]
    tempFile?: File
    previewUrl?: string
}

export interface NameXContainer extends EditorContainer {
    goal: number
    title: string
    items: NameXItemContainer
}

export type NameXItemContainer =
    { type: 'artist', items: FlatArtist[] }
    | { type: 'album', items: FlatAlbum[] }
    | { type: 'track', items: FlatTrack[] }
    | { type: 'text', items: string[] }

export interface OrderContainer extends EditorContainer {
    title: string
    showNames: boolean
    items: OrderItem[]
}

export interface OrderItem {
    parent_id?: number
    index: number
    track: FlatTrack
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

export interface LostInTranslationContainer extends EditorContainer {
    track: FlatTrack
    textTranslated: String
    textOriginal: String
    translationChain: String
}

export interface WordleContainer extends EditorContainer {
    artist: FlatArtist
}

export interface NavigatorContainer extends EditorContainer {
    from: RichArtist
    to: RichArtist
    steps: number
}

export interface PuzzleContainer extends EditorContainer {
    tracks: RichTrack[]
}