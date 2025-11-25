import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {TimelineContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import TimelineGame from "~/components/games/timeline/TimelineGame.vue";
import TimelineIcon from "~/components/games/timeline/TimelineIcon.vue";
import TimelinePreview from "~/components/games/timeline/TimelinePreview.vue";
import TimelineEditor from "~/components/games/timeline/TimelineEditor.vue";

export class ClientTimelineGame extends ClientGameDef<TimelineContainer> {

    constructor() {
        super(GAME_METAS.Timeline, TimelineGame, TimelineIcon, TimelinePreview, TimelineEditor);
    }

    override getIconPreviewTitle(container: TimelineContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: TimelineContainer): string {
        return container.title;
    }

    override getHelpText(container: TimelineContainer): string {
        return "Your task is to select the correct year.\n" +
            "You can submit your order by pressing 'Submit'.\n\n" +
            "You only have one attempt at guessing!\n" +
            "Can't figure it out? Use the skip button!";
    }
}