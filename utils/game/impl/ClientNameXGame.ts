import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {NameXContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import NameXGame from "~/components/games/namex/NameXGame.vue";
import NameXIcon from "~/components/games/namex/NameXIcon.vue";
import NameXPreview from "~/components/games/namex/NameXPreview.vue";
import NameXEditor from "~/components/games/namex/NameXEditor.vue";

export class ClientNameXGame extends ClientGameDef<NameXContainer> {

    constructor() {
        super(GAME_METAS.NameX, NameXGame, NameXIcon, NameXPreview, NameXEditor);
    }

    override getIconPreviewTitle(container: NameXContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: NameXContainer): string {
        return container.title
    }
}