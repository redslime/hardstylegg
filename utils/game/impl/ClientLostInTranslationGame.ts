import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {LostInTranslationContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import {getName} from "~/utils/tracks";
import LostInTranslationGame from "~/components/games/lost-in-translation/LostInTranslationGame.vue";
import LostInTranslationIcon from "~/components/games/lost-in-translation/LostInTranslationIcon.vue";
import LostInTranslationPreview from "~/components/games/lost-in-translation/LostInTranslationPreview.vue";
import LostInTranslationEditor from "~/components/games/lost-in-translation/LostInTranslationEditor.vue";
import LostInTranslationSummary from "~/components/games/lost-in-translation/LostInTranslationSummary.vue";

export class ClientLostInTranslationGame extends ClientGameDef<LostInTranslationContainer> {

    constructor() {
        super(GAME_METAS.LostInTranslation, LostInTranslationGame, LostInTranslationIcon, LostInTranslationPreview,
            LostInTranslationEditor, LostInTranslationSummary);
    }

    override getIconPreviewTitle(container: LostInTranslationContainer): string {
        return "Which track do these lyrics belong to?"
    }

    override getDashboardHeaderTitle(container: LostInTranslationContainer): string {
        return getName(container.track);
    }

    override getHelpText(container: LostInTranslationContainer): string {
        return "Your task is to identify the track this lyrics belong to.\n" +
            "The lyrics have been translated a number of times.\n" +
            "Start typing in the search bar to find the track you're looking for.\n\n" +
            "You have unlimited attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!";
    }
}