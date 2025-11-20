import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {HeardleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import HeardleGame from "~/components/games/heardle/HeardleGame.vue";
import HeardleIcon from "~/components/games/heardle/HeardleIcon.vue";
import HeardlePreview from "~/components/games/heardle/HeardlePreview.vue";
import {getName} from "~/utils/tracks";
import HeardleEditor from "~/components/games/heardle/HeardleEditor.vue";

export class ClientHeardleGame extends ClientGameDef<HeardleContainer> {

    constructor() {
        super(GAME_METAS.Heardle, HeardleGame, HeardleIcon, HeardlePreview, HeardleEditor);
    }

    override getIconPreviewTitle(container: HeardleContainer): string {
        return "What is the name of this track?";
    }

    override getDashboardHeaderTitle(container: HeardleContainer): string {
        return getName(container.track)
    }
}