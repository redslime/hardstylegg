import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {PuzzleContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import {RichArtist, RichTrack} from "~/types/content";
import PuzzleGame from "~/components/games/puzzle/PuzzleGame.vue";
import PuzzleIcon from "~/components/games/puzzle/PuzzleIcon.vue";
import PuzzlePreview from "~/components/games/puzzle/PuzzlePreview.vue";
import PuzzleEditor from "~/components/games/puzzle/PuzzleEditor.vue";
import PuzzleSummary from "~/components/games/puzzle/PuzzleSummary.vue";
import type {GameReport} from "~/types/models";
import {shuffleArray} from "~/utils/utils";

export class ClientPuzzleGame extends ClientGameDef<PuzzleContainer> {

    constructor() {
        super(GAME_METAS.Puzzle, PuzzleGame, PuzzleIcon, PuzzlePreview, PuzzleEditor, PuzzleSummary);
    }

    override getIconPreviewTitle(container: PuzzleContainer): string {
        return `Piece together this puzzle of ${container.tracks?.length ?? 0} tracks`
    }

    override getDashboardHeaderTitle(container: PuzzleContainer): string {
        return this.getIconPreviewTitle(container);
    }

    override getHelpText(container: PuzzleContainer): string {
        return "Your task is to piece together this puzzle of " + container.tracks.length + " tracks!\n" +
            "You can do so by drag and dropping (or click on) track titles and artists onto the empty slots.\n" +
            "You have unlimited attempts!\n\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): PuzzleContainer {
        if("tracks" in data) {
            const { tracks, ...rest } = data
            const arr = tracks as any[]

            return <PuzzleContainer>{
                ...rest,
                tracks: arr.map(RichTrack.fromJson)
            }
        }

        return data
    }

    override getPreviewDetails(reportItem: GameReport, container: PuzzleContainer): string {
        if(reportItem.success) {
            return this.respondAttempts(reportItem)
        } else {
            return this.respondCompleted(reportItem, container)
        }
    }

    protected override getPreviewOptions(container: PuzzleContainer): number | "?" {
        return container.tracks.length
    }

    public calculatePoolItems(container: PuzzleContainer): PuzzleItem[] {
        const items: PuzzleItem[] = []
        let count = 1

        container.tracks.forEach(track => {
            const titleItem: PuzzleItem = {
                id: count++,
                type: 'title',
                val: track.getDisplayName(true),
            }

            items.push(titleItem)
            track.artists.forEach(artist => {
                const artistItem: PuzzleItem = {
                    id: count++,
                    type: 'artist',
                    val: artist,
                }

                items.push(artistItem)
            })
        })

        return shuffleArray(items)
    }
}

export interface PuzzleItem {
    id: number
    type: 'title' | 'artist'
    val: string | RichArtist
}