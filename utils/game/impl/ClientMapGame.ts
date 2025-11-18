import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {MapContainer} from "~/types/gameModels";
import MapIcon from "~/components/icons/game/MapIcon.vue";
import MapPreview from "~/components/dashboard/preview/MapPreview.vue";
import {GAME_METAS} from "#shared/games";
import Map from "~/components/games/Map.vue";

export class ClientMapGame extends ClientGameDef<MapContainer> {

    constructor() {
        super(GAME_METAS.Map, Map, MapIcon, MapPreview);
    }

    override getIconPreviewTitle(container: MapContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: MapContainer): string {
        return container.title
    }
}