import type {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import {ServerMapGame} from "~/server/utils/game/impl/ServerMapGame";
import {ServerArtworkGame} from "~/server/utils/game/impl/ServerArtworkGame";
import {ServerCompleteAlbumGame} from "~/server/utils/game/impl/ServerCompleteAlbumGame";
import {ServerCompleteLyricsGame} from "~/server/utils/game/impl/ServerCompleteLyricsGame";
import {ServerHeardleGame} from "~/server/utils/game/impl/ServerHeardleGame";
import {ServerNameXGame} from "~/server/utils/game/impl/ServerNameXGame";
import {ServerOrderGame} from "~/server/utils/game/impl/ServerOrderGame";
import {ServerQuizGame} from "~/server/utils/game/impl/ServerQuizGame";
import {ServerTimelineGame} from "~/server/utils/game/impl/ServerTimelineGame";
import {ServerTimetableGame} from "~/server/utils/game/impl/ServerTimetableGame";
import {ServerZoomerGame} from "~/server/utils/game/impl/ServerZoomerGame";

const games: ServerGameDef<any>[] = []

function checkRegistered() {
    if(games.length === 0) registerGames()
}

export function getGames<T extends EditorContainer>(): ServerGameDef<T>[] {
    checkRegistered()
    return games
}

export function findGameById<T extends EditorContainer>(id: number): ServerGameDef<T> | undefined {
    checkRegistered()
    return games.find(g => g.id === id)
}

export function findGameByName<T extends EditorContainer>(name: string): ServerGameDef<T> | undefined {
    checkRegistered()
    return games.find(g => g.name.toLowerCase() === name.toLowerCase())
}

export function registerGames() {
    games.push(
        new ServerArtworkGame(),
        new ServerCompleteAlbumGame(),
        new ServerCompleteLyricsGame(),
        new ServerHeardleGame(),
        new ServerNameXGame(),
        new ServerOrderGame(),
        new ServerQuizGame(),
        new ServerTimelineGame(),
        new ServerTimetableGame(),
        new ServerMapGame(),
        new ServerZoomerGame()
    )
}