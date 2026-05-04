import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {NavigatorContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import {RichArtist} from "~/types/content";
import NavigatorGame from "~/components/games/navigator/NavigatorGame.vue";
import NavigatorIcon from "~/components/games/navigator/NavigatorIcon.vue";
import NavigatorPreview from "~/components/games/navigator/NavigatorPreview.vue";
import NavigatorEditor from "~/components/games/navigator/NavigatorEditor.vue";
import NavigatorSummary from "~/components/games/navigator/NavigatorSummary.vue";
import type {GameReport} from "~/types/models";

export class ClientNavigatorGame extends ClientGameDef<NavigatorContainer> {

    constructor() {
        super(GAME_METAS.Navigator, NavigatorGame, NavigatorIcon, NavigatorPreview, NavigatorEditor, NavigatorSummary);
    }

    override getIconPreviewTitle(container: NavigatorContainer): string {
        const from = container?.from?.getDisplayName() ?? "?"
        const to = container?.to?.getDisplayName() ?? "?"

        return `Navigate from ${from} to ${to} in ${container.steps} steps!`;
    }

    override getDashboardHeaderTitle(container: NavigatorContainer): string {
        const from = container?.from?.getDisplayName() ?? "?"
        const to = container?.to?.getDisplayName() ?? "?"

        return `${from} → ${to} in ${container.steps}`;
    }

    override getHelpText(container: NavigatorContainer): string {
        return "Your task is to navigate from " + container.from.getDisplayName() + " to " + container.to.getDisplayName() + ".\n"
            + "You can do so by clicking on other artists credited on collabs.\n"
            + "Every time you jump to another artist counts as one step.\n"
            + "You have " + container.steps + " steps to navigate to " + container.to.getDisplayName() + "!\n\n"
            + "Can't figure it out? Use the skip button!";
    }

    override getPreviewDetails(reportItem: GameReport, container: NavigatorContainer): string {
        return this.respondAttempts(reportItem)
    }

    override remap(data: any): NavigatorContainer {
        if("from" in data && "to" in data) {
            return <NavigatorContainer>{
                ...data,
                from: RichArtist.fromJson(data.from),
                to: RichArtist.fromJson(data.to)
            }
        }

        return data
    }
}