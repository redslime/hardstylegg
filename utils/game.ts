import Pencil from "~/components/icons/game/Pencil.vue";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import ChatBubble from "~/components/icons/game/ChatBubble.vue";
import SpeakerWave from "~/components/icons/game/SpeakerWave.vue";
import ListBullet from "~/components/icons/game/ListBullet.vue";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import Calendar from "~/components/icons/game/Calendar.vue";
import {type GameContainer, type GameData, GameState, type PackedDayData} from "~/types/models";

export const gameComps = {
    Artwork: { id: 1, comp: defineAsyncComponent(() => import("~/components/games/Artwork.vue")), icon: Pencil },
    CompleteAlbum: { id: 2, comp: defineAsyncComponent(() => import("~/components/games/CompleteAlbum.vue")), icon: PencilSquare },
    CompleteLyrics: { id: 3, comp: defineAsyncComponent(() => import("~/components/games/CompleteLyrics.vue")), icon: ChatBubble },
    Heardle: { id: 4, comp: defineAsyncComponent(() => import("~/components/games/Heardle.vue")), icon: SpeakerWave },
    NameX: { id: 5, comp: defineAsyncComponent(() => import("~/components/games/NameX.vue")), icon: ListBullet },
    Order: { id: 6, comp: defineAsyncComponent(() => import("~/components/games/Order.vue")), icon: ArrowsRightLeft },
    Quiz: { id: 7, comp: defineAsyncComponent(() => import("~/components/games/Quiz.vue")), icon: CheckCircle },
    Timeline: { id: 8, comp: defineAsyncComponent(() => import("~/components/games/Timeline.vue")), icon: Calendar },
    Timetable: { id: 9, comp: defineAsyncComponent(() => import("~/components/games/Timetable.vue")), icon: PencilSquare },
}

export function transform(data: PackedDayData): GameContainer {
    const types: number[] = data.typeIds
    const gameData: object[] = data.data
    const transformed: GameData[] = []

    if(types.length === gameData.length) {
        for(let i = 0; i < gameData.length; i++) {
            const type = types[i]
            const data = gameData[i]

            transformed.push({
                name: getName(type),
                props: {
                    state: i === 0 ? GameState.PLAYING : GameState.UPCOMING,
                    container: {
                        ...data
                    }
                }
            })
        }
    }

    return {
        dayId: data.dayId,
        data: transformed
    }
}

export function getIcon(type_id: number): any {
    for(const [_, comp] of Object.entries(gameComps)) {
        if(comp.id == type_id) {
            return comp.icon
        }
    }
}

function getName(type_id: number): string {
    for(const [name, comp] of Object.entries(gameComps)) {
        if(comp.id == type_id) {
            return name
        }
    }

    return "invalid"
}