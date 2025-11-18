import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {QuizContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import Quiz from "~/components/games/Quiz.vue";
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import QuizPreview from "~/components/dashboard/preview/QuizPreview.vue";

export class ClientQuizGame extends ClientGameDef<QuizContainer> {

    constructor() {
        super(GAME_METAS.Quiz, Quiz, CheckCircle, QuizPreview);
    }

    override getIconPreviewTitle(container: QuizContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: QuizContainer): string {
        return container.title;
    }
}