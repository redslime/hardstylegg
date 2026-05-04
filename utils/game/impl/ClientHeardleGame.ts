import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {HeardleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import HeardleGame from "~/components/games/heardle/HeardleGame.vue";
import HeardleIcon from "~/components/games/heardle/HeardleIcon.vue";
import HeardlePreview from "~/components/games/heardle/HeardlePreview.vue";
import HeardleEditor from "~/components/games/heardle/HeardleEditor.vue";
import HeardleSummary from "~/components/games/heardle/HeardleSummary.vue";
import {FlatTrack} from "~/types/content";
import type {GameReport} from "~/types/models";

export class ClientHeardleGame extends ClientGameDef<HeardleContainer> {

    constructor() {
        super(GAME_METAS.Heardle, HeardleGame, HeardleIcon, HeardlePreview, HeardleEditor, HeardleSummary);
    }

    override getIconPreviewTitle(container: HeardleContainer): string {
        return "What is the name of this track?"
    }

    override getDashboardHeaderTitle(container: HeardleContainer): string {
        return container.track.getDisplayName()
    }

    override getHelpText(container: HeardleContainer): string {
        return "Your task is to identify this track by listening to short snippets.\n" +
            "Start typing in the search bar to find the track you're looking for.\n" +
            "You have " + container.durations.length + " attempts at guessing.\n" +
            "With each incorrect guess, the track snippet becomes longer.\n" +
            "No idea what to guess? You can extend the snippet by pressing 'Next stage'.\n\n" +
            "Can't figure it out? Use the skip button!";
    }

    override getPreloadUrls(container: HeardleContainer): string[] {
        return [container.track.getImageUrl()]
    }

    override getPreviewDetails(reportItem: GameReport, container: HeardleContainer): string {
        return this.respondAttempts(reportItem)
    }

    override remap(data: any): HeardleContainer {
        if("track" in data) {
            return <HeardleContainer>{
                ...data,
                track: FlatTrack.fromJson(data.track)
            }
        }

        return data
    }
}