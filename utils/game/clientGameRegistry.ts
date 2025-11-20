import {ClientGameDef} from "~/utils/game/ClientGameDef";
import {ClientMapGame} from "~/utils/game/impl/ClientMapGame";
import {ClientArtworkGame} from "~/utils/game/impl/ClientArtworkGame";
import {ClientCompleteAlbumGame} from "~/utils/game/impl/ClientCompleteAlbumGame";
import {ClientCompleteLyricsGame} from "~/utils/game/impl/ClientCompleteLyricsGame";
import {ClientHeardleGame} from "~/utils/game/impl/ClientHeardleGame";
import {ClientNameXGame} from "~/utils/game/impl/ClientNameXGame";
import {ClientOrderGame} from "~/utils/game/impl/ClientOrderGame";
import {ClientQuizGame} from "~/utils/game/impl/ClientQuizGame";
import {ClientTimelineGame} from "~/utils/game/impl/ClientTimelineGame";
import {ClientTimetableGame} from "~/utils/game/impl/ClientTimetableGame";

const games: ClientGameDef<any>[] = []

export const ArtworkDef = new ClientArtworkGame()
export const CompleteAlbumDef = new ClientCompleteAlbumGame()
export const CompleteLyricsDef = new ClientCompleteLyricsGame()
export const HeardleDef = new ClientHeardleGame()
export const NameXDef = new ClientNameXGame()
export const OrderDef = new ClientOrderGame()
export const QuizDef = new ClientQuizGame()
export const TimelineDef = new ClientTimelineGame()
export const TimetableDef = new ClientTimetableGame()
export const MapDef = new ClientMapGame()

function checkRegistered() {
    if(games.length === 0) registerGames()
}

export function getGames(): ClientGameDef<any>[] {
    checkRegistered()
    return games
}

export function findGameById(id: number): ClientGameDef<any> | undefined {
    checkRegistered()
    return games.find(g => g.id === id)
}

export function findGameByName(name: string): ClientGameDef<any> | undefined {
    checkRegistered()
    return games.find(g => g.name.toLowerCase() === name.toLowerCase())
}

export function registerGames() {
    games.push(
        ArtworkDef,
        CompleteAlbumDef,
        CompleteLyricsDef,
        HeardleDef,
        NameXDef,
        OrderDef,
        QuizDef,
        TimelineDef,
        TimetableDef,
        MapDef
    )
}