import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {MapContainer} from "~/types/gameModels";
import MapIcon from "~/components/games/map/MapIcon.vue";
import MapPreview from "~/components/games/map/MapPreview.vue";
import {GAME_METAS} from "#shared/games";
import MapGame from "~/components/games/map/MapGame.vue";
import MapSummary from "~/components/games/map/MapSummary.vue";
import MapEditor from "~/components/games/map/MapEditor.vue";

export class ClientMapGame extends ClientGameDef<MapContainer> {

    constructor() {
        super(GAME_METAS.Map, MapGame, MapIcon, MapPreview, MapEditor, MapSummary);
    }

    override getIconPreviewTitle(container: MapContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: MapContainer): string {
        return container.title
    }

    override getHelpText(container: MapContainer): string {
        return "Your task is to click the correct country on the map.\n\n" +
            "You only have one attempt at guessing!\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): MapContainer {
        return data
    }
}