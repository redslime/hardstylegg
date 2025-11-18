import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {TimetableContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Timetable from "~/components/games/Timetable.vue";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import TimetablePreview from "~/components/dashboard/preview/TimetablePreview.vue";

export class ClientTimetableGame extends ClientGameDef<TimetableContainer> {

    constructor() {
        super(GAME_METAS.Timetable, Timetable, PencilSquare, TimetablePreview);
    }

    override getIconPreviewTitle(container: TimetableContainer): string {
        return "Complete the timetable"
    }

    override getDashboardHeaderTitle(container: TimetableContainer): string {
        return container.title;
    }
}