import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {NameXContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import NameX from "~/components/games/NameX.vue";
import ListBullet from "~/components/icons/game/ListBullet.vue";
import NameXPreview from "~/components/dashboard/preview/NameXPreview.vue";

export class ClientNameXGame extends ClientGameDef<NameXContainer> {

    constructor() {
        super(GAME_METAS.NameX, NameX, ListBullet, NameXPreview);
    }

    override getIconPreviewTitle(container: NameXContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: NameXContainer): string {
        return container.title
    }
}