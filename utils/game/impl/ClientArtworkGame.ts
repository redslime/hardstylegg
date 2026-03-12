import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {ArtworkContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import ArtworkIcon from "~/components/games/artwork/ArtworkIcon.vue";
import ArtworkPreview from "~/components/games/artwork/ArtworkPreview.vue";
import ArtworkGame from "~/components/games/artwork/ArtworkGame.vue";
import ArtworkEditor from "~/components/games/artwork/ArtworkEditor.vue";
import ArtworkSummary from "~/components/games/artwork/ArtworkSummary.vue";
import {FlatTrack} from "~/types/content";
import {getLocalArtwork} from "~/utils/utils";

export class ClientArtworkGame extends ClientGameDef<ArtworkContainer> {

    constructor() {
        super(GAME_METAS.Artwork, ArtworkGame, ArtworkIcon, ArtworkPreview, ArtworkEditor, ArtworkSummary);
    }

    override getIconPreviewTitle(container: ArtworkContainer): string {
        return "Which track does this artwork belong to?"
    }

    override getDashboardHeaderTitle(container: ArtworkContainer): string {
        return container.track.getDisplayName()
    }

    override getHelpText(container: ArtworkContainer): string {
        return "Your task is to identify the track this artwork belongs to.\n" +
            "Start typing in the search bar to find the track you're looking for.\n\n" +
            "You have unlimited attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!"
    }

    override getPreloadUrls(container: ArtworkContainer): string[] {
        return [getLocalArtwork(container.imgName)!!, container.track.getImageUrl()]
    }

    override remap(data: any): ArtworkContainer {
        if("track" in data) {
            return <ArtworkContainer>{
                ...data,
                track: FlatTrack.fromJson(data.track)
            }
        }

        return data
    }
}