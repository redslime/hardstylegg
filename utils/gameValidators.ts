import type {
    CompleteAlbumContainer,
    CompleteLyricsContainer,
    NameXContainer,
    OrderContainer,
    QuizContainer,
    TimelineContainer
} from "~/types/gameModels";

export function validateCompleteAlbum(album: CompleteAlbumContainer): string[] {
    const errors: string[] = []

    album.items.forEach(item => {
        if(!item.name || item.name.trim().length === 0) {
            errors.push("Track name is required")
        }
        if(item.name.trim().length > 128) {
            errors.push("Track name is too long")
        }
        if(!item.artist || item.artist.trim().length === 0) {
            errors.push("Track artist is required")
        }
        if(item.artist.trim().length > 128) {
            errors.push("Track artist is too long")
        }
    })

    if(album.items.filter(i => i.hidden).length === 0) {
        errors.push("At least one track must be hidden")
    }

    return errors
}

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

export function validateNameX(namex : NameXContainer): string[] {
    const errors: string[] = []

    validateTitle(namex.title, errors)

    if(!namex.goal) {
        errors.push("Goal is required")
    }
    if(namex.goal === 0 || namex.goal > namex.items.length) {
        errors.push("Goal must be between 1 and " + namex.items.length)
    }
    if(!namex.items || namex.items.length === 0) {
        errors.push("At least one track is required")
    }
    if(new Set(namex.items.map(t => t.sid)).size < namex.items.length) {
        errors.push("Each track must be unique")
    }

    return errors
}

export function validateOrder(order: OrderContainer): string[] {
    const errors: string[] = []

    validateTitle(order.title, errors)

    if(!order.items || order.items.length < 2) {
        errors.push("At least two tracks are required")
    }
    if(order.items.length > 6) {
        errors.push("Maximum of 6 tracks are allowed")
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
    if(!title || title.trim().length === 0) {
        errors.push("Title is required")
    }
    if(title.length > 128) {
        errors.push("Title is too long")
    }
}