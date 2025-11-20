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
}