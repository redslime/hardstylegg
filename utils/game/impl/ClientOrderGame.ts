import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {OrderContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import OrderGame from "~/components/games/order/OrderGame.vue";
import OrderIcon from "~/components/games/order/OrderIcon.vue";
import OrderPreview from "~/components/games/order/OrderPreview.vue";
import OrderEditor from "~/components/games/order/OrderEditor.vue";
import OrderSummary from "~/components/games/order/OrderSummary.vue";
import {FlatTrack} from "~/types/content";

export class ClientOrderGame extends ClientGameDef<OrderContainer> {

    constructor() {
        super(GAME_METAS.Order, OrderGame, OrderIcon, OrderPreview, OrderEditor, OrderSummary);
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

    override getPreloadUrls(container: OrderContainer): string[] {
        return container.items.map(item => item.track.getImageUrl())
    }

    override remap(data: any): OrderContainer {
        return <OrderContainer>{
            ...data,
            items: data.items.map((item: any) => ({...item, track: FlatTrack.fromJson(item.track)}))
        }
    }
}