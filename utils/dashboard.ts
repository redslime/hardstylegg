import type {DashboardData, ScheduleDay} from "~/types/models";
import type {QuizContainer} from "~/types/gameModels";

let dashboardData: DashboardData | null = null;
let quizData: QuizContainer[] | null = null;

export async function getDashboardData(): Promise<DashboardData> {
    if(dashboardData !== null) return dashboardData
    dashboardData = await $fetch<DashboardData>('/api/dashboard')
    return dashboardData
}

export async function getQuizData(): Promise<QuizContainer[]> {
    if(quizData !== null) return quizData
    quizData = await $fetch<QuizContainer[]>('/api/dashboard/quiz')
    return quizData
}

export function getScheduleForGame(typeId: number, gameId: number | undefined): ScheduleDay | undefined {
    if(gameId === undefined) return undefined

    return dashboardData?.schedule?.days?.find(day => {
        const typeIds = day.typeIds
        const gameIds = day.gameIds

        if (typeIds.length === gameIds.length) {
            for (let i = 0; i < gameIds.length; i++) {
                const tid = typeIds[i]
                const gid = gameIds[i]

                if (typeId === tid && gameId === gid) {
                    return day
                }
            }
        }
    })
}