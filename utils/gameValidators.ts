import type {CompleteLyricsContainer, QuizContainer, TimelineContainer} from "~/types/gameModels";

export function validateCompleteLyrics(lyrics: CompleteLyricsContainer): string[] {
    const regex = /\[\[(.+?)\]\]/g
    const errors: string[] = []

    if(!lyrics.track) {
        errors.push("Track is required")
    }
    if(!lyrics.text) {
        errors.push("Lyrics are required")
    }
    if(lyrics.text?.length > 1024) {
        errors.push("Lyrics are too long")
    }
    if(lyrics.text?.trim().length === 0) {
        errors.push("Lyrics can't be empty")
    }
    if(lyrics.text?.split('\n').length < 2) {
        errors.push("Lyrics must have at least 2 lines")
    }
    if(lyrics.text?.split('\n').filter(l => regex.test(l)).length === 0) {
        errors.push("Lyrics must contain at least one input")
    }

    return errors
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

function validateTitle(title: string, errors: string[]) {
    if(title.trim().length === 0) {
        errors.push("Title is required")
    }
    if(title.length > 128) {
        errors.push("Title is too long")
    }
}