import type {GameMeta} from "#shared/GameMeta";
import {
    validateArtwork,
    validateCompleteAlbum,
    validateCompleteLyrics,
    validateHeardle,
    validateLostInTranslation,
    validateMap,
    validateNameX,
    validateNavigator,
    validateOrder,
    validatePuzzle,
    validateQuiz,
    validateTimeline,
    validateTimetable,
    validateWordle,
    validateZoomer
} from "#shared/gameValidators";

export const GAME_METAS = {
    Artwork: {
        id: 1,
        name: "Artwork",
        validator: validateArtwork
    },
    CompleteAlbum: {
        id: 2,
        name: "CompleteAlbum",
        validator: validateCompleteAlbum
    },
    CompleteLyrics: {
        id: 3,
        name: "CompleteLyrics",
        validator: validateCompleteLyrics
    },
    Heardle: {
        id: 4,
        name: "Heardle",
        validator: validateHeardle
    },
    NameX: {
        id: 5,
        name: "NameX",
        validator: validateNameX
    },
    Order: {
        id: 6,
        name: "Order",
        validator: validateOrder
    },
    Quiz: {
        id: 7,
        name: "Quiz",
        validator: validateQuiz
    },
    Timeline: {
        id: 8,
        name: "Timeline",
        validator: validateTimeline
    },
    Timetable: {
        id: 9,
        name: "Timetable",
        validator: validateTimetable
    },
    Map: {
        id: 10,
        name: "Map",
        validator: validateMap
    },
    Zoomer: {
        id: 11,
        name: "Zoomer",
        validator: validateZoomer
    },
    LostInTranslation: {
        id: 12,
        name: "LostInTranslation",
        validator: validateLostInTranslation
    },
    Wordle: {
        id: 13,
        name: "Wordle",
        validator: validateWordle
    },
    Navigator: {
        id: 14,
        name: "Navigator",
        validator: validateNavigator
    },
    Puzzle: {
        id: 15,
        name: "Puzzle",
        validator: validatePuzzle
    }
 } satisfies Record<string, GameMeta>
export const YEAR_FILTER_GAMES = [GAME_METAS.Artwork.id, GAME_METAS.CompleteAlbum.id, GAME_METAS.CompleteLyrics.id, GAME_METAS.Heardle.id]

export function encodeSelection(selected: GameMeta[]): string {
    return encodeIdSelection(selected.map(g => g.id))
}

export function encodeIdSelection(ids: number[]): string {
    let mask = 0
    for (const id of ids) {
        mask |= 1 << id
    }
    return mask.toString(16)
}

export function decodeSelection(hex: string): GameMeta[] {
    const mask = parseInt(hex, 16)
    return Object.values(GAME_METAS).filter(item => (mask & (1 << item.id)) !== 0)
}