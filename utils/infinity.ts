import {type GameData, GameState, type InfinityPreviewContainer, type InfinityResponseContainer} from "~/types/models";
import {copyToClipboard, distinct} from "~/utils/utils";
import {encodeIdSelection} from "#shared/games";

export const INFINITY_START_YEAR = 2000
export const INFINITY_END_YEAR = 2026

let infinityPreview: InfinityPreviewContainer | null = null
let infinityData: InfinityResponseContainer | null = null
let years: { start: number, end: number } | null = null

export function startInfinity(data: InfinityResponseContainer) {
    infinityData = data
}

export function setYears(start: number, end: number) {
    years = {start, end}
}

export async function getInfinityPreview(): Promise<InfinityPreviewContainer> {
    if(infinityPreview === null) {
        infinityPreview = await $fetch<InfinityPreviewContainer>('/api/infinity')
    }

    return infinityPreview
}

export function getInfinityShareCode(): string | undefined | null {
    return infinityData?.shareCode
}

export function copyInfinityResult(gameData: GameData[]) {
    const { $gameRegistry } = useNuxtApp()
    const total = gameData.length
    const successful = gameData.filter(g => g.props.state === GameState.SUCCEEDED).length
    const percentage = Math.round((successful / total) * 100)

    if(infinityData) {
        const yearParam = years ? `&y=${years.start}:${years.end}` : ""

        if(infinityData.shareCode) {
            // ?icc
            const url = `https://hardstyle.gg/share?icc=${infinityData.shareCode}&s=${successful}/${total}${yearParam}`
            copyToClipboard(`I scored ${percentage}% in Infinity challenge ${infinityData.shareCode}. Can you beat me?\n${url}`)
        } else {
            // ?ic
            const gameDefs = distinct(gameData.map(g => g.name)).map(s => $gameRegistry.findGameByName(s))
            const typeIds = gameDefs.filter(s => s !== undefined).map(s => s.id!!)
            const typeIdsEncoding = encodeIdSelection(typeIds)
            const url = `https://hardstyle.gg/share?ic=${typeIdsEncoding}&s=${successful}/${total}${yearParam}`
            copyToClipboard(`I scored ${percentage}% in Infinity mode. Can you beat me?\n${url}`)
        }
    }
}