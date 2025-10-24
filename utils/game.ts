import Pencil from "~/components/icons/game/Pencil.vue";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import ChatBubble from "~/components/icons/game/ChatBubble.vue";
import SpeakerWave from "~/components/icons/game/SpeakerWave.vue";
import ListBullet from "~/components/icons/game/ListBullet.vue";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import Calendar from "~/components/icons/game/Calendar.vue";
import {type GameContainer, type GameData, GameState, type PackedDayData} from "~/types/models";
import Artwork from "~/components/games/Artwork.vue";
import CompleteAlbum from "~/components/games/CompleteAlbum.vue";
import CompleteLyrics from "~/components/games/CompleteLyrics.vue";
import Heardle from "~/components/games/Heardle.vue";
import NameX from "~/components/games/NameX.vue";
import Order from "~/components/games/Order.vue";
import Quiz from "~/components/games/Quiz.vue";
import Timeline from "~/components/games/Timeline.vue";
import Timetable from "~/components/games/Timetable.vue";

let packedGameData: GameContainer | null = null

export const gameComps = {
    Artwork: { id: 1, comp: Artwork, icon: Pencil, preview: (props: any) => "What is the name of this track?" },
    CompleteAlbum: { id: 2, comp: CompleteAlbum, icon: PencilSquare, preview: (props: any) => "Fill in the missing tracks" },
    CompleteLyrics: { id: 3, comp: CompleteLyrics, icon: ChatBubble, preview: (props: any) => "Fill in the missing lyrics" },
    Heardle: { id: 4, comp: Heardle, icon: SpeakerWave, preview: (props: any) => "What is the name of this track?" },
    NameX: { id: 5, comp: NameX, icon: ListBullet, preview: (props: any) => props.container.title },
    Order: { id: 6, comp: Order, icon: ArrowsRightLeft, preview: (props: any) => props.container.title },
    Quiz: { id: 7, comp: Quiz, icon: CheckCircle, preview: (props: any) => props.container.title },
    Timeline: { id: 8, comp: Timeline, icon: Calendar, preview: (props: any) => props.container.title },
    Timetable: { id: 9, comp: Timetable, icon: PencilSquare, preview: (props: any) => "Complete the timetable" },
}

export async function getGameContainer(): Promise<GameContainer> {
    if(packedGameData === null) {
        const { data, pending, error, refresh } = await useAsyncData(
            () => $fetch('/api/today')
            // ,{ lazy: true } // ensures it fetches client-side only
        )
        packedGameData = transform(data.value as PackedDayData)
    }

    return packedGameData
}

export function transform(data: PackedDayData): GameContainer {
    const types: number[] = data.typeIds
    const gameData: object[] = data.data
    const transformed: GameData[] = []

    if(types.length === gameData.length) {
        for(let i = 0; i < gameData.length; i++) {
            const type = types[i]
            const data = gameData[i]

            if(type && data) {
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
    }

    return {
        dayId: data.dayId,
        dayFriendly: data.dayFriendly,
        data: transformed
    }
}

export function getPreviewTitle(data: GameData): string {
    return gameComps[data.name as keyof typeof gameComps].preview(data.props)
}

function getName(type_id: number): string {
    for(const [name, comp] of Object.entries(gameComps)) {
        if(comp.id == type_id) {
            return name
        }
    }

    return "invalid"
}