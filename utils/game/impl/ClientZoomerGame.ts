import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {ZoomerContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import ZoomerGame from "~/components/games/zoomer/ZoomerGame.vue";
import ZoomerIcon from "~/components/games/zoomer/ZoomerIcon.vue";
import ZoomerPreview from "~/components/games/zoomer/ZoomerPreview.vue";
import ZoomerEditor from "~/components/games/zoomer/ZoomerEditor.vue";
import ZoomerSummary from "~/components/games/zoomer/ZoomerSummary.vue";
import type {ZoomerType} from "~/types/zoomerModels";
import {shallowRecordEquals} from "~/utils/utils";
import type {GameReport} from "~/types/models";

export class ClientZoomerGame extends ClientGameDef<ZoomerContainer> {

    constructor() {
        super(GAME_METAS.Zoomer, ZoomerGame, ZoomerIcon, ZoomerPreview, ZoomerEditor, ZoomerSummary)
    }

    public getTitle(container: ZoomerContainer): string {
        if(container.goal.id === "artist") {
            return "Which artist is pictured here?"
        } else if(container.goal.id === "festival") {
            return "Which festival is pictured here?"
        }

        return "invalid"
    }

    public getImgUrl(container: ZoomerContainer): string {
        return "/zoomer/" + container.data.imgName + ".webp"
    }

    public isEqual(goal: ZoomerType, val: ZoomerType): boolean {
        // artist matching is handled elsewhere
        if(goal.id === "festival" && goal.id === val.id) {
            if(goal.name !== val.name) return false
            if(goal.years as number !== val.years as number) return false
            return shallowRecordEquals(goal.fields, val.fields);
        }

        return false
    }

    getDashboardHeaderTitle(container: ZoomerContainer): string {
        return container.title
    }

    getHelpText(container: ZoomerContainer): string {
        const tries = container.data.stepHeights.length
        return "Your task is to identify the stage or artist on the image.\n" +
            "Start typing or selecting your guess.\n" +
            "With each guess, the image zooms out more and more.\n\n" +
            "You have " + tries + " attempts at guessing.\n" +
            "Can't figure it out? Use the skip button!";
    }

    getIconPreviewTitle(container: ZoomerContainer): string {
        return container.title
    }

    override getPreloadUrls(container: ZoomerContainer): string[] {
        return ['/zoomer/' + container.data.imgName + ".webp"]
    }

    override getPreviewDetails(reportItem: GameReport, container: ZoomerContainer): string {
        return this.respondAttempts(reportItem)
    }

    override remap(data: any): ZoomerContainer {
        return data
    }
}