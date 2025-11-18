import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {TimelineContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Timeline from "~/components/games/Timeline.vue";
import Calendar from "~/components/icons/game/Calendar.vue";
import TimelinePreview from "~/components/dashboard/preview/TimelinePreview.vue";

export class ClientTimelineGame extends ClientGameDef<TimelineContainer> {

    constructor() {
        super(GAME_METAS.Timeline, Timeline, Calendar, TimelinePreview);
    }

    override getIconPreviewTitle(container: TimelineContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: TimelineContainer): string {
        return container.title;
    }
}