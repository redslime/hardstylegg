import {DEFAULT_PLAYER_STATS_RANGE, type PlayerStatsContainer, type PlayerStatsRange} from "~/types/playerStats.ts";

export const useDashboardStore = defineStore('dashboard', () => {
    const compactList = ref<boolean>(false)
    const statsRange = ref<PlayerStatsRange>(DEFAULT_PLAYER_STATS_RANGE)
    const { data: playerStats, pending: playerPending, error: playerError } = useAsyncData<PlayerStatsContainer>(`player-stats-${statsRange.value}`,
        () => $fetch<PlayerStatsContainer>('/api/dashboard/stats/players',
            { query: { range: statsRange.value } }),
        { watch: [statsRange] })

    return { compactList, statsRange, playerStats, playerPending, playerError }
})