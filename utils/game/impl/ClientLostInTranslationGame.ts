import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {LostInTranslationContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import LostInTranslationGame from "~/components/games/lost-in-translation/LostInTranslationGame.vue";
import LostInTranslationIcon from "~/components/games/lost-in-translation/LostInTranslationIcon.vue";
import LostInTranslationPreview from "~/components/games/lost-in-translation/LostInTranslationPreview.vue";
import LostInTranslationEditor from "~/components/games/lost-in-translation/LostInTranslationEditor.vue";
import LostInTranslationSummary from "~/components/games/lost-in-translation/LostInTranslationSummary.vue";
import {FlatTrack} from "~/types/content";

export class ClientLostInTranslationGame extends ClientGameDef<LostInTranslationContainer> {

    constructor() {
        super(GAME_METAS.LostInTranslation, LostInTranslationGame, LostInTranslationIcon, LostInTranslationPreview,
            LostInTranslationEditor, LostInTranslationSummary);
    }

    override getIconPreviewTitle(container: LostInTranslationContainer): string {
        return "Which track do these translated lyrics belong to?"
    }

    override getDashboardHeaderTitle(container: LostInTranslationContainer): string {
        return container.track.getDisplayName()
    }

    override getHelpText(container: LostInTranslationContainer): string {
        return "Your task is to identify the track this lyrics belong to.\n" +
            "The lyrics have been translated a number of times.\n" +
            "Start typing in the search bar to find the track you're looking for.\n\n" +
            "You have unlimited attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): LostInTranslationContainer {
        if("track" in data) {
            return <LostInTranslationContainer>{
                ...data,
                track: FlatTrack.fromJson(data.track)
            }
        }

        return data
    }
}