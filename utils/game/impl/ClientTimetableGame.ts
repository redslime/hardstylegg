import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {TimetableContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import TimetableGame from "~/components/games/timetable/TimetableGame.vue";
import TimetablePreview from "~/components/games/timetable/TimetablePreview.vue";
import TimetableEditor from "~/components/games/timetable/TimetableEditor.vue";
import TimetableIcon from "~/components/games/timetable/TimetableIcon.vue";

export class ClientTimetableGame extends ClientGameDef<TimetableContainer> {

    constructor() {
        super(GAME_METAS.Timetable, TimetableGame, TimetableIcon, TimetablePreview, TimetableEditor);
    }

    override getIconPreviewTitle(container: TimetableContainer): string {
        return "Complete the timetable"
    }

    override getDashboardHeaderTitle(container: TimetableContainer): string {
        return container.title;
    }
}