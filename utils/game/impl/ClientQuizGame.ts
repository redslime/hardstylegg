import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {QuizContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import QuizGame from "~/components/games/quiz/QuizGame.vue";
import QuizIcon from "~/components/games/quiz/QuizIcon.vue";
import QuizPreview from "~/components/games/quiz/QuizPreview.vue";
import QuizEditor from "~/components/games/quiz/QuizEditor.vue";

export class ClientQuizGame extends ClientGameDef<QuizContainer> {

    constructor() {
        super(GAME_METAS.Quiz, QuizGame, QuizIcon, QuizPreview, QuizEditor);
    }

    override getIconPreviewTitle(container: QuizContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: QuizContainer): string {
        return container.title;
    }

    override getHelpText(container: QuizContainer): string {
        return "Your task is to select the correct answer.\n" +
            "Some questions may accept multiple answers.\n\n" +
            "You only have one attempt at guessing!\n" +
            "Can't figure it out? Use the skip button!";
    }
}