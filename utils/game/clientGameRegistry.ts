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

export const ArtworkGame = new ClientArtworkGame()
export const CompleteAlbumGame = new ClientCompleteAlbumGame()
export const CompleteLyricsGame = new ClientCompleteLyricsGame()
export const HeardleGame = new ClientHeardleGame()
export const NameXGame = new ClientNameXGame()
export const OrderGame = new ClientOrderGame()
export const QuizGame = new ClientQuizGame()
export const TimelineGame = new ClientTimelineGame()
export const TimetableGame = new ClientTimetableGame()
export const MapGame = new ClientMapGame()

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
    return games.find(g => g.name === name)
}

export function registerGames() {
    games.push(
        ArtworkGame,
        CompleteAlbumGame,
        CompleteLyricsGame,
        HeardleGame,
        NameXGame,
        OrderGame,
        QuizGame,
        TimelineGame,
        TimetableGame,
        MapGame
    )
}