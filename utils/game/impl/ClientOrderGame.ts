import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {OrderContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Order from "~/components/games/Order.vue";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import OrderPreview from "~/components/dashboard/preview/OrderPreview.vue";

export class ClientOrderGame extends ClientGameDef<OrderContainer> {

    constructor() {
        super(GAME_METAS.Order, Order, ArrowsRightLeft, OrderPreview);
    }

    override getIconPreviewTitle(container: OrderContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: OrderContainer): string {
        return container.title;
    }
}