import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteAlbumGame from "~/components/games/complete-album/CompleteAlbumGame.vue";
import CompleteAlbumIcon from "~/components/games/complete-album/CompleteAlbumIcon.vue";
import CompleteAlbumPreview from "~/components/games/complete-album/CompleteAlbumPreview.vue";
import {getName} from "~/utils/tracks";
import CompleteAlbumEditor from "~/components/games/complete-album/CompleteAlbumEditor.vue";

export class ClientCompleteAlbumGame extends ClientGameDef<CompleteAlbumContainer> {

    constructor() {
        super(GAME_METAS.CompleteAlbum, CompleteAlbumGame, CompleteAlbumIcon, CompleteAlbumPreview, CompleteAlbumEditor);
    }

    override getIconPreviewTitle(container: CompleteAlbumContainer): string {
        return "Fill in the missing tracks";
    }

    override getDashboardHeaderTitle(container: CompleteAlbumContainer): string {
        return getName(container.album!!)
    }
}