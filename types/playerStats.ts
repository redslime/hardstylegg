export type PlayerStatsContainer = Record<number, { dayFriendly: string, played: number; completed: number; onApp: number; }>

export const PLAYER_STATS_RANGES = {
    '2w': {
        label: '2w',
        daysBack: 14,
    },
    '3m': {
        label: '3m',
        daysBack: 84,
    },
    all: {
        label: 'all',
        daysBack: null,
    },
} as const

export type PlayerStatsRange = keyof typeof PLAYER_STATS_RANGES

export const PLAYER_STATS_RANGE_OPTIONS = Object.keys(PLAYER_STATS_RANGES) as PlayerStatsRange[]

export const DEFAULT_PLAYER_STATS_RANGE: PlayerStatsRange = '2w'

export function isPlayerStatsRange(value: unknown): value is PlayerStatsRange {
    return typeof value === 'string' && value in PLAYER_STATS_RANGES
}