import {getArchiveGame} from "~/utils/archive.ts";
import {debug} from "~/utils/utils.ts";
import {GameState} from "~/types/models.ts";

export const useArchiveStore = defineStore('archive', () => {
    const lastDayId = ref<number | null>(null)
    const nextDayId = ref<number | null>(null) // helper to force GameFlow change from outside
    const playedIds = ref<number[]>([])
    const archiveScores = ref<Record<number, GameState[]>>({})

    function reportScore(dayId: number, scores: GameState[]) {
        archiveScores.value[dayId] = scores
    }

    function getGameScore(dayId: number, index: number): GameState {
        if(archiveScores.value[dayId] === undefined) return GameState.UPCOMING
        return archiveScores.value[dayId][index] ?? GameState.UPCOMING
    }

    function hasPlayed(dayId: number) {
        return playedIds.value.includes(dayId)
    }

    watch(lastDayId, id => {
        if(id === null) return
        playedIds.value.push(id)

        // make sure we load ahead in case the user chooses day-1 next
        getArchiveGame(id-2).then(() => debug("loaded archive game for day " + (id-2) + " in background"))
    })

    return { lastDayId, nextDayId, hasPlayed, reportScore, getGameScore }
})