import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import {ClientArtworkGame} from "~/utils/game/impl/ClientArtworkGame";
import {ClientCompleteAlbumGame} from "~/utils/game/impl/ClientCompleteAlbumGame";
import {ClientCompleteLyricsGame} from "~/utils/game/impl/ClientCompleteLyricsGame";
import {ClientHeardleGame} from "~/utils/game/impl/ClientHeardleGame";
import {ClientNameXGame} from "~/utils/game/impl/ClientNameXGame";
import {ClientOrderGame} from "~/utils/game/impl/ClientOrderGame";
import {ClientQuizGame} from "~/utils/game/impl/ClientQuizGame";
import {ClientTimelineGame} from "~/utils/game/impl/ClientTimelineGame";
import {ClientTimetableGame} from "~/utils/game/impl/ClientTimetableGame";
import {ClientMapGame} from "~/utils/game/impl/ClientMapGame";
import {ClientZoomerGame} from "~/utils/game/impl/ClientZoomerGame";
import {ClientLostInTranslationGame} from "~/utils/game/impl/ClientLostInTranslationGame";

export class ClientGameRegistry {
    private games: ClientGameDef<any>[] = []

    public ArtworkDef = new ClientArtworkGame()
    public CompleteAlbumDef = new ClientCompleteAlbumGame()
    public CompleteLyricsDef = new ClientCompleteLyricsGame()
    public HeardleDef = new ClientHeardleGame()
    public NameXDef = new ClientNameXGame()
    public OrderDef = new ClientOrderGame()
    public QuizDef = new ClientQuizGame()
    public TimelineDef = new ClientTimelineGame()
    public TimetableDef = new ClientTimetableGame()
    public MapDef = new ClientMapGame()
    public ZoomerDef = new ClientZoomerGame()
    public LostInTranslationDef = new ClientLostInTranslationGame()

    constructor() {
        this.games.push(
            this.ArtworkDef,
            this.CompleteAlbumDef,
            this.CompleteLyricsDef,
            this.HeardleDef,
            this.NameXDef,
            this.OrderDef,
            this.QuizDef,
            this.TimelineDef,
            this.TimetableDef,
            this.MapDef,
            this.ZoomerDef,
            this.LostInTranslationDef
        )
    }

    getGames() {
        return this.games
    }

    findGameById(id: number) {
        return this.games.find(g => g.id === id)
    }

    findGameByName(name: string) {
        return this.games.find(g => g.name.toLowerCase() === name.toLowerCase())
    }
}