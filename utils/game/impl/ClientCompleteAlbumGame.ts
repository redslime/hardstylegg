import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteAlbum from "~/components/games/CompleteAlbum.vue";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import CompleteAlbumPreview from "~/components/dashboard/preview/CompleteAlbumPreview.vue";
import {getName} from "~/utils/tracks";

export class ClientCompleteAlbumGame extends ClientGameDef<CompleteAlbumContainer> {

    constructor() {
        super(GAME_METAS.CompleteAlbum, CompleteAlbum, PencilSquare, CompleteAlbumPreview);
    }

    override getIconPreviewTitle(container: CompleteAlbumContainer): string {
        return "Fill in the missing tracks";
    }

    override getDashboardHeaderTitle(container: CompleteAlbumContainer): string {
        return getName(container.album!!)
    }
}