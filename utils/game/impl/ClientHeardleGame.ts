import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {HeardleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Heardle from "~/components/games/Heardle.vue";
import SpeakerWave from "~/components/icons/game/SpeakerWave.vue";
import HeardlePreview from "~/components/dashboard/preview/HeardlePreview.vue";
import {getName} from "~/utils/tracks";

export class ClientHeardleGame extends ClientGameDef<HeardleContainer> {

    constructor() {
        super(GAME_METAS.Heardle, Heardle, SpeakerWave, HeardlePreview);
    }

    override getIconPreviewTitle(container: HeardleContainer): string {
        return "What is the name of this track?";
    }

    override getDashboardHeaderTitle(container: HeardleContainer): string {
        return getName(container.track)
    }
}