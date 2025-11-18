import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteLyrics from "~/components/games/CompleteLyrics.vue";
import ChatBubble from "~/components/icons/game/ChatBubble.vue";
import CompleteLyricsPreview from "~/components/dashboard/preview/CompleteLyricsPreview.vue";
import {getName} from "~/utils/tracks";

export class ClientCompleteLyricsGame extends ClientGameDef<CompleteLyricsContainer> {

    constructor() {
        super(GAME_METAS.CompleteLyrics, CompleteLyrics, ChatBubble, CompleteLyricsPreview);
    }

    override getIconPreviewTitle(container: CompleteLyricsContainer): string {
        return "Fill in the missing lyrics"
    }

    override getDashboardHeaderTitle(container: CompleteLyricsContainer): string {
        return getName(container.track)
    }
}