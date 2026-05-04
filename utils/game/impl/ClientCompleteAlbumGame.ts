import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteAlbumGame from "~/components/games/complete-album/CompleteAlbumGame.vue";
import CompleteAlbumIcon from "~/components/games/complete-album/CompleteAlbumIcon.vue";
import CompleteAlbumPreview from "~/components/games/complete-album/CompleteAlbumPreview.vue";
import CompleteAlbumEditor from "~/components/games/complete-album/CompleteAlbumEditor.vue";
import CompleteAlbumSummary from "~/components/games/complete-album/CompleteAlbumSummary.vue";
import {FlatAlbum} from "~/types/content";
import type {GameReport} from "~/types/models";

export class ClientCompleteAlbumGame extends ClientGameDef<CompleteAlbumContainer> {

    constructor() {
        super(GAME_METAS.CompleteAlbum, CompleteAlbumGame, CompleteAlbumIcon, CompleteAlbumPreview, CompleteAlbumEditor, CompleteAlbumSummary);
    }

    override getIconPreviewTitle(container: CompleteAlbumContainer): string {
        return "Fill in the missing tracks";
    }

    override getDashboardHeaderTitle(container: CompleteAlbumContainer): string {
        return container.album!!.getDisplayName()
    }

    override getHelpText(container: CompleteAlbumContainer): string {
        const albumName = container.album ? container.album.title + " by " + container.album.getArtistsString() : "this album"
        return "Your task is to fill out the missing tracks of " + albumName + ".\n" +
            "Start typing in the input fields to submit your guesses.\n" +
            "Correct ones are automatically accepted!\n" +
            "The order of the tracks matters!\n\n" +
            "You have unlimited attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!";
    }

    override getPreviewDetails(reportItem: GameReport, container: CompleteAlbumContainer): string {
        return this.respondCompleted(reportItem, container)
    }

    protected override getPreviewOptions(container: CompleteAlbumContainer): number | "?" {
        return container.items.length
    }

    override remap(data: any): CompleteAlbumContainer {
        if("album" in data) {
            return <CompleteAlbumContainer>{
                ...data,
                album: FlatAlbum.fromJson(data.album)
            }
        }

        return data
    }
}