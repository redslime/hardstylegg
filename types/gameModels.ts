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

export function validateQuiz(quiz: QuizContainer): string[] {
    const errors: string[] = []

    validateTitle(quiz.title, errors)

    if(quiz.items.length < 2) {
        errors.push("At least 2 answer options are required")
    }
    for(const item of quiz.items) {
        if(item.text.length > 64) {
            errors.push("Answer option is too long")
        }
    }
    for(const item of quiz.items) {
        if(item.text.trim().length === 0) {
            errors.push("Answer can't be empty")
        }
    }
    if(quiz.items.filter(i => !i.correct).length === 0) {
        errors.push("At least one answer option must be false")
    }
    if(quiz.items.filter(i => i.correct).length < 1) {
        errors.push("At least one answer option must be correct")
    }

    return errors
}

export interface TimelineContainer {
    id?: number
    created_by?: number
    title: string
    goal: number
}

export function validateTimeline(timeline: TimelineContainer): string[] {
    const errors: string[] = []

    validateTitle(timeline.title, errors)

    if(!timeline.goal) {
        errors.push("Year is required")
    } else if(timeline.goal > 2025) {
        errors.push("Year can't be higher than 2025")
    } else if(timeline.goal < 2000) {
        errors.push("Year can't be lower than 2000")
    }

    return errors
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

function validateTitle(title: string, errors: string[]) {
    if(title.trim().length === 0) {
        errors.push("Title is required")
    }
    if(title.length > 128) {
        errors.push("Title is too long")
    }
}