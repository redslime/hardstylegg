import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteLyricsGame from "~/components/games/complete-lyrics/CompleteLyricsGame.vue";
import CompleteLyricsIcon from "~/components/games/complete-lyrics/CompleteLyricsIcon.vue";
import CompleteLyricsPreview from "~/components/games/complete-lyrics/CompleteLyricsPreview.vue";
import {getName} from "~/utils/tracks";
import CompleteLyricsEditor from "~/components/games/complete-lyrics/CompleteLyricsEditor.vue";

export class ClientCompleteLyricsGame extends ClientGameDef<CompleteLyricsContainer> {

    constructor() {
        super(GAME_METAS.CompleteLyrics, CompleteLyricsGame, CompleteLyricsIcon, CompleteLyricsPreview, CompleteLyricsEditor);
    }

    override getIconPreviewTitle(container: CompleteLyricsContainer): string {
        return "Fill in the missing lyrics"
    }

    override getDashboardHeaderTitle(container: CompleteLyricsContainer): string {
        return getName(container.track)
    }
}