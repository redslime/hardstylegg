import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {ArtworkContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Artwork from "~/components/games/Artwork.vue";
import Pencil from "~/components/icons/game/Pencil.vue";
import ArtworkPreview from "~/components/dashboard/preview/ArtworkPreview.vue";
import {getName} from "~/utils/tracks";

export class ClientArtworkGame extends ClientGameDef<ArtworkContainer> {

    constructor() {
        super(GAME_METAS.Artwork, Artwork, Pencil, ArtworkPreview);
    }

    override getIconPreviewTitle(container: ArtworkContainer): string {
        return "Which track does this artwork belong to?"
    }

    override getDashboardHeaderTitle(container: ArtworkContainer): string {
        return getName(container.track)
    }
}