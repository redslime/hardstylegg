import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {ArtworkContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import ArtworkIcon from "~/components/games/artwork/ArtworkIcon.vue";
import ArtworkPreview from "~/components/games/artwork/ArtworkPreview.vue";
import {getName} from "~/utils/tracks";
import ArtworkGame from "~/components/games/artwork/ArtworkGame.vue";
import ArtworkEditor from "~/components/games/artwork/ArtworkEditor.vue";

export class ClientArtworkGame extends ClientGameDef<ArtworkContainer> {

    constructor() {
        super(GAME_METAS.Artwork, ArtworkGame, ArtworkIcon, ArtworkPreview, ArtworkEditor);
    }

    override getIconPreviewTitle(container: ArtworkContainer): string {
        return "Which track does this artwork belong to?"
    }

    override getDashboardHeaderTitle(container: ArtworkContainer): string {
        return getName(container.track)
    }
}