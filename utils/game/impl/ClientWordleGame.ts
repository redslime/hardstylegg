import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {WordleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import {FlatArtist} from "~/types/content";
import WordleGame from "~/components/games/wordle/WordleGame.vue";
import WordleIcon from "~/components/games/wordle/WordleIcon.vue";
import WordlePreview from "~/components/games/wordle/WordlePreview.vue";
import WordleEditor from "~/components/games/wordle/WordleEditor.vue";
import WordleSummary from "~/components/games/wordle/WordleSummary.vue";

export const enum LetterState {
    INITIAL = 0,
    CORRECT = 'correct', // x
    PRESENT = 'present', // o
    ABSENT = 'absent' // -
}

export class ClientWordleGame extends ClientGameDef<WordleContainer> {

    constructor() {
        super(GAME_METAS.Wordle, WordleGame, WordleIcon, WordlePreview, WordleEditor, WordleSummary);
    }

    override getIconPreviewTitle(container: WordleContainer): string {
        return "Find the artist name"
    }

    override getDashboardHeaderTitle(container: WordleContainer): string {
        return "Find the artist name"
    }

    override getHelpText(container: WordleContainer): string {
        return "Your task is to find the artist name by playing Wordle!\n" +
            "Begin by typing any artist name and pressing enter.\n" +
            "You have 6 attempts at guessing.\n" +
            "With each guess, every letter becomes colored in gray/yellow/green.\n" +
            "Gray means the letter is not in the artist name.\n" +
            "Yellow means the letter exists in the artist name.\n" +
            "Green means the letter exist in the artist name at the same position.\n\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): WordleContainer {
        if("artist" in data) {
            return <WordleContainer>{
                ...data,
                artist: FlatArtist.fromJson(data.artist)
            }
        }

        return data
    }

    public serializeBoard(board: {letter: string, state: LetterState}[][]): string {
        let str = ""

        for(let row = 0; row < board.length; row++) {
            for(let col = 0; col < board[row]!!.length; col++) {
                const state = board[row]!![col]!!.state

                if(state === LetterState.CORRECT) {
                    str += "x"
                } else if(state === LetterState.PRESENT) {
                    str += "o"
                } else {
                    str += "-"
                }
            }

            str += ","
        }

        while(str.endsWith(",")) {
            str = str.substring(0, str.length - 1)
        }

        return str
    }
}