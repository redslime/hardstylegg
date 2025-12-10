import type {GameMeta} from "#shared/GameMeta";
import {
    validateArtwork,
    validateCompleteAlbum,
    validateCompleteLyrics,
    validateHeardle,
    validateMap,
    validateNameX,
    validateOrder,
    validateQuiz,
    validateTimeline,
    validateTimetable, validateZoomer
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
    }
 } satisfies Record<string, GameMeta>