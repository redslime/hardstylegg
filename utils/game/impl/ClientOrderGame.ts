import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {OrderContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import OrderGame from "~/components/games/order/OrderGame.vue";
import OrderIcon from "~/components/games/order/OrderIcon.vue";
import OrderPreview from "~/components/games/order/OrderPreview.vue";
import OrderEditor from "~/components/games/order/OrderEditor.vue";

export class ClientOrderGame extends ClientGameDef<OrderContainer> {

    constructor() {
        super(GAME_METAS.Order, OrderGame, OrderIcon, OrderPreview, OrderEditor);
    }

    override getIconPreviewTitle(container: OrderContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: OrderContainer): string {
        return container.title;
    }

    override getHelpText(container: OrderContainer): string {
        return "Your track is to correctly order the " + container.items.length + " tracks.\n" +
            "Order from old to new!\n" +
            "You can submit your order by pressing 'Submit'.\n\n" +
            "You only have one attempt at guessing!\n" +
            "Can't figure it out? Use the skip button!";
    }
}