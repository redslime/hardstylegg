import Pencil from "~/components/icons/game/Pencil.vue";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import ChatBubble from "~/components/icons/game/ChatBubble.vue";
import SpeakerWave from "~/components/icons/game/SpeakerWave.vue";
import ListBullet from "~/components/icons/game/ListBullet.vue";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import Calendar from "~/components/icons/game/Calendar.vue";
import {
    type CookieDayMemory,
    type GameContainer,
    type GameData,
    type GameReport,
    GameState,
    type PackedDayData,
    type ReportContainer
} from "~/types/models";
import Artwork from "~/components/games/Artwork.vue";
import CompleteAlbum from "~/components/games/CompleteAlbum.vue";
import CompleteLyrics from "~/components/games/CompleteLyrics.vue";
import Heardle from "~/components/games/Heardle.vue";
import NameX from "~/components/games/NameX.vue";
import Order from "~/components/games/Order.vue";
import Quiz from "~/components/games/Quiz.vue";
import Timeline from "~/components/games/Timeline.vue";
import Timetable from "~/components/games/Timetable.vue";
import {debug} from "~/utils/utils";

let currentTypeId: number | null = null
let currentGameId: number | null = null
let report: ReportContainer | null = null
let packedGameData: GameContainer | null = null

export const gameComps = {
    Artwork: { id: 1, comp: Artwork, icon: Pencil, preview: (props: any) => "Which track does this artwork belong to?" },
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
        const data = await $fetch<PackedDayData>('/api/today')
        packedGameData = transform(data)
    }

    return packedGameData
}

export function transform(data: PackedDayData): GameContainer {
    const types: number[] = data.typeIds
    const gameData: object[] = data.data
    const theme: string | null | undefined = data.theme
    const transformed: GameData[] = []

    if(types.length === gameData.length) {
        for(let i = 0; i < gameData.length; i++) {
            const type = types[i]
            const data = gameData[i]

            if(type && data) {
                transformed.push({
                    name: getGameName(type),
                    props: {
                        state: i === 0 ? GameState.PLAYING : GameState.UPCOMING,
                        position: i,
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
        theme,
        editors: data.editors,
        data: transformed
    }
}

export function getPreviewTitle(data: GameData): string {
    return gameComps[data.name as keyof typeof gameComps].preview(data.props)
}

export function getGameName(type_id: number): string {
    for(const [name, comp] of Object.entries(gameComps)) {
        if(comp.id == type_id) {
            return name
        }
    }

    return "invalid"
}

export function updateState(typeId: number | null, gameId: number | null) {
    currentTypeId = typeId
    currentGameId = gameId
}

export function startGame() {
    if(import.meta.env.DEV) {
        debug("Not creating a performance report in dev mode")
        return
    }

    getGameContainer().then(gameData => {
        $fetch<string>("/api/report/start").then(code => {
            report = {
                code,
                dayId: gameData.dayId,
                dayFriendly: gameData.dayFriendly,
                successes: 0,
                completed: false,
                data: []
            }
        }).catch(_ => {})
    })
}

export function countAttempt() {
    reportResult(r => {
        if(r.attempts) {
            r.attempts++
        } else {
            r.attempts = 1
        }
    })
}

export function countItem(id: number | undefined, success: boolean) {
    if(id === undefined) return

    reportResult(r => {
        if(r.itemsCompleted) {
            r.itemsCompleted[id] = success
        } else {
            r.itemsCompleted = {}
            r.itemsCompleted[id] = success
        }
    })
}

export function countOption(id: number | undefined) {
    if(id === undefined) return

    reportResult(r => {
        if(r.itemsClicked) {
            r.itemsClicked.push(id)
        } else {
            r.itemsClicked = [id]
        }
    })
}

export function reportResult(consumer: (report: GameReport) => void) {
    if(report && currentTypeId && currentGameId) {
        const gr = report.data.find(r => r.typeId === currentTypeId && r.gameId === currentGameId)

        if(gr) {
            consumer(gr)
        } else {
            const gr = {
                typeId: currentTypeId,
                gameId: currentGameId,
                success: false
            }
            consumer(gr)
            report.data.push(gr)
        }
    }
}

export function sendReport() {
    if(report === null) return

    $fetch("/api/report/submit", {
        method: "POST",
        body: report
    }).catch(err => console.error("Failed to send report", err))
}

export function getReportCode() {
    return report?.code
}

export function getCookieMemory(): CookieDayMemory | undefined {
    if(report === null) return undefined

    return {
        day: report.dayId,
        data: report.data.map(d => d.success)
    }
}

export function hasPlayedToday(cookie: CookieDayMemory[] | undefined, todayId: number | undefined): boolean {
    if(cookie) {
        const today = cookie.find(d => d.day === todayId)

        if(today) {
            return true
        }
    }

    return false
}