import type {
    ArtworkContainer,
    CompleteAlbumContainer,
    CompleteLyricsContainer,
    HeardleContainer,
    LostInTranslationContainer,
    MapContainer,
    NameXContainer,
    NavigatorContainer,
    OrderContainer,
    PuzzleContainer,
    QuizContainer,
    TimelineContainer,
    TimetableContainer,
    TimetableItem,
    WordleContainer,
    ZoomerContainer
} from "~/types/gameModels";

export function validateArtwork(artwork: ArtworkContainer): string[] {
    const errors: string[] = []

    if(!artwork.track) {
        errors.push("Track is required")
    }
    if(!artwork.img64 && !artwork.imgName) {
        errors.push("Artwork file is required")
    }

    return errors
}

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

export function validateHeardle(heardle: HeardleContainer): string[] {
    const errors: string[] = []

    if(!heardle.track) {
        errors.push("Track is required")
    }
    if(!heardle.src || heardle.src.trim().length === 0) {
        errors.push("Track file is required (click on upload when segments are done)")
    }
    if(!heardle.durations || heardle.durations.length === 0) {
        errors.push("Track segments are required")
    }
    if(heardle.durations) {
        validateHeardleDurations(heardle.durations, errors)
    }

    return errors
}

export function validateHeardleDurations(durations: number[], errors: string[]) {
    if(durations.length < 3) {
        errors.push("At least 3 track segments are required")
    }
    if(durations.length > 6) {
        errors.push("Maximum of 6 track segments are allowed")
    }
    if(durations.filter(d => d > 15).length > 0) {
        errors.push("Track segments can't be longer than 15 seconds")
    }
    if(new Set(durations).size !== durations.length) {
        errors.push("Track segments must be unique")
    }
    if(durations[durations.length - 1]!! !== 15) {
        errors.push("Last track segment must be 15 seconds")
    }
    if(durations.length > 1) {
        for(let i = 1; i < durations.length; i++) {
            if(durations[i]!! <= durations[i - 1]!!) {
                errors.push("Track segments must be increasing in duration")
                break
            }
        }
    }
}

export function validateNameX(namex : NameXContainer): string[] {
    const errors: string[] = []
    let itemKeys: string[]

    if(namex.items.type === 'artist') {
        itemKeys = namex.items.items.map(a => a.id)
    } else if(namex.items.type === 'album' || namex.items.type === 'track') {
        itemKeys = namex.items.items.map(c => c.sid)
    } else {
        itemKeys = namex.items.items
    }

    validateTitle(namex.title, errors)

    if(!namex.goal) {
        errors.push("Goal is required")
    }
    if(namex.goal === 0 || namex.goal > namex.items.items.length) {
        errors.push("Goal must be between 1 and " + namex.items.items.length)
    }
    if(!namex.items || namex.items.items.length === 0) {
        errors.push("At least one item is required")
    }
    if(new Set(itemKeys).size < namex.items.items.length) {
        errors.push("Each track item be unique")
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

export function validateTimetable(timetable: TimetableContainer): string[] {
    const errors: string[] = []
    const rgbRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

    validateTitle(timetable.title, errors)
    timetable.items.forEach(item => validateTimetableItem(item, errors))

    if(!timetable.color_bg || !rgbRegex.test(timetable.color_bg)) {
        errors.push("Background color is invalid")
    }
    if(!timetable.color_text || !rgbRegex.test(timetable.color_text)) {
        errors.push("Text color is invalid")
    }
    if(!timetable.items || timetable.items.length === 0) {
        errors.push("Timetable cannot be empty")
    }
    if(timetable.items.filter(i => i.hidden).length === 0) {
        errors.push("At least one act must be hidden")
    }

    return errors
}

export function validateTimetableItem(item: TimetableItem, errors: string[]) {
    const regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    
    if(!item.name || item.name.trim().length === 0) {
        errors.push("Act name cannot be empty")
    }
    if(!regex.test(item.begin)) {
        errors.push("Begin time is invalid")
    }
    if(!regex.test(item.end)) {
        errors.push("End time is invalid")
    }
    if(item.begin === item.end) {
        errors.push("Begin and end time must be different")
    }
}

export function validateMap(map: MapContainer): string[] {
    const errors: string[] = []

    validateTitle(map.title, errors)

    if(!map.goal || map.goal.trim().length === 0) {
        errors.push("Country goal is required")
    }

    return errors
}

export function validateZoomer(zoomer: ZoomerContainer): string[] {
    const errors: string[] = []

    validateTitle(zoomer.title, errors)

    if(!zoomer.data || zoomer.data.stepHeights.length !== 5) {
        errors.push("5 image zoom levels required")
    }

    if(!zoomer.goal) {
        errors.push("Goal is required")
    }

    return errors
}

export function validateLostInTranslation(lit: LostInTranslationContainer): string[] {
    const errors: string[] = []

    if(!lit.track) {
        errors.push("Track is required")
    }

    if(!lit.textTranslated || lit.textTranslated.trim().length === 0) {
        errors.push("Translation is required")
    }

    if(!lit.textOriginal || lit.textOriginal.trim().length === 0) {
        errors.push("Original lyrics are required")
    }

    if(!lit.translationChain || lit.translationChain.length === 0) {
        errors.push("Translation chain is required")
    }

    return errors
}

export function validateWordle(wordle: WordleContainer): string[] {
    const errors: string[] = []

    if(!wordle.artist) {
        errors.push("Artist is required")
    } else {
        if(!(/^[a-zA-Z,-]*$/.test(wordle.artist.name.toLowerCase()))) {
            errors.push("Artist name can only contain - and letters (no spaces!)")
        }
    }

    return errors
}

export function validateNavigator(navigator: NavigatorContainer): string[] {
    const errors: string[] = []

    if(!navigator.from) {
        errors.push("Start artist is required")
    }
    if(!navigator.to) {
        errors.push("End artist is required")
    }
    if(navigator?.to?.id === navigator?.from?.id) {
        errors.push("Start and end artists must be different")
    }
    if(!navigator.steps) {
        errors.push("Max step count is required")
    }
    if(navigator.steps < 2) {
        errors.push("Max step count must be at least 2")
    }
    if(navigator.steps > 5) {
        errors.push("Max step count must be at most 5")
    }

    return errors
}

export function validatePuzzle(puzzle: PuzzleContainer): string[] {
    const errors: string[] = []

    if(!puzzle.tracks) {
        errors.push("Tracks are required")
    } else {
        if(puzzle.tracks.length < 2) {
            errors.push("At least 2 tracks required")
        }
        if(puzzle.tracks.length < new Set(puzzle.tracks).size) {
            errors.push("Tracks must be unique!")
        }
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