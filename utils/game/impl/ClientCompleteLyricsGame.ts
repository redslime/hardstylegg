import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import CompleteLyricsGame from "~/components/games/complete-lyrics/CompleteLyricsGame.vue";
import CompleteLyricsIcon from "~/components/games/complete-lyrics/CompleteLyricsIcon.vue";
import CompleteLyricsPreview from "~/components/games/complete-lyrics/CompleteLyricsPreview.vue";
import CompleteLyricsEditor from "~/components/games/complete-lyrics/CompleteLyricsEditor.vue";
import CompleteLyricsSummary from "~/components/games/complete-lyrics/CompleteLyricsSummary.vue";
import {FlatTrack} from "~/types/content";

export class ClientCompleteLyricsGame extends ClientGameDef<CompleteLyricsContainer> {

    constructor() {
        super(GAME_METAS.CompleteLyrics, CompleteLyricsGame, CompleteLyricsIcon, CompleteLyricsPreview, CompleteLyricsEditor, CompleteLyricsSummary);
    }

    override getIconPreviewTitle(container: CompleteLyricsContainer): string {
        return "Fill in the missing lyrics"
    }

    override getDashboardHeaderTitle(container: CompleteLyricsContainer): string {
        return container.track.getDisplayName()
    }

    override getHelpText(container: CompleteLyricsContainer): string {
        const trackName = container.track.title + " by " + container.track.getArtistsString()
        return "Your task is to fill out the missing lyrics of " + trackName + ".\n" +
            "Start typing in the input fields to submit your guesses.\n" +
            "Correct ones are automatically accepted!\n\n" +
            "You have unlimited attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): CompleteLyricsContainer {
        if("track" in data) {
            return <CompleteLyricsContainer>{
                ...data,
                track: FlatTrack.fromJson(data.track)
            }
        }

        return data
    }
}