import {
    type CookieDayMemory,
    type GameContainer,
    type GameData,
    type GameReport,
    GameState,
    type PackedDayData,
    type ReportContainer
} from "~/types/models";
import {debug} from "~/utils/utils";

let currentTypeId: number | null = null
let currentGameId: number | null = null
let report: ReportContainer | null = null
let packedGameData: GameContainer | null = null

export async function getGameContainer(): Promise<GameContainer> {
    if(packedGameData === null) {
        const data = await $fetch<PackedDayData>('/api/today')
        packedGameData = transform(data)
    }

    return packedGameData
}

export function transform(data: PackedDayData): GameContainer {
    const { $gameRegistry } = useNuxtApp();
    const types: number[] = data.typeIds
    const gameData: object[] = data.data
    const theme: string | null | undefined = data.theme
    const transformed: GameData[] = []

    if(types.length === gameData.length) {
        for(let i = 0; i < gameData.length; i++) {
            const type = types[i]
            const data = gameData[i]

            if(type && data) {
                const gameDef = $gameRegistry.findGameById(type)!!

                transformed.push({
                    name: gameDef.name,
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
    const { $gameRegistry } = useNuxtApp();
    const gameDef = $gameRegistry.findGameByName(data.name)!!
    return gameDef.getIconPreviewTitle(data.props.container)
}

export function getGameName(type_id: number): string {
    const { $gameRegistry } = useNuxtApp();
    const gameDef = $gameRegistry.findGameById(type_id)!!
    return gameDef.name
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