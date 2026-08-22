<script setup lang="ts">
import {useDashboardStore} from "~/stores/dashboard.ts";
import type {ApexOptions} from "apexcharts";
import {PLAYER_STATS_RANGE_OPTIONS, type PlayerStatsContainer} from "~/types/playerStats.ts";

const store = useDashboardStore()
const { playerStats, playerPending, playerError } = storeToRefs(store)

const baseOptions: ApexOptions = {
  theme: {
    mode: 'dark',
  },
  colors: ['#008FFB', '#00E396', '#FEB019'],
  chart: {
    id: 'performance',
    background: 'transparent',
    type: 'area',
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    animations: {
      enabled: false,
    },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${val}`
    }
  },
  tooltip: {
    enabled: true
  },
  stroke: {
    curve: 'smooth',
    dashArray: [2, 0, 2],
    width: [4, 3, 2],
  },
  legend: {
    showForNullSeries: false,
    onItemClick: {
      toggleDataSeries: false
    }
  },
  dataLabels: {
    enabled: false
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          width: '100%'
        },
      }
    }
  ]
}

const options = ref<ApexOptions>(baseOptions)
let series = reactive([{}])
const valid = computed(() => playerStats.value && Object.keys(playerStats.value).length > 0)

watch(playerStats, (d: PlayerStatsContainer | undefined) => {
  if(!d) return

  const simplified = store.statsRange !== '2w'

  options.value = {
    ...baseOptions,
    xaxis: {
      categories: Object.values(d).map(v => v.dayFriendly),
      labels: {
        show: !simplified
      },
    },
    markers: {
      size: simplified ? 0 : 3
    }
  }

  const startedData = Object.values(d).map(v => v.played)
  const completedData = Object.values(d).map(v => v.completed)
  const onAppData = Object.values(d).map(v => v.onApp)

  series = [
    {
      name: 'Started',
      data: startedData
    },
    {
      name: 'Completed',
      data: completedData
    },
    {
      name: 'On app',
      data: onAppData
    }
  ]
}, { immediate: true })
</script>

<template>
  <div class="bg-base-200 p-7 rounded-md">
    <div class="flex justify-between">
      <h2 class="text-2xl font-bold mb-5 text-center">Player stats</h2>

      <div class="join">
        <button v-for="range in PLAYER_STATS_RANGE_OPTIONS" :key="range"
            class="btn btn-primary btn-xs join-item"
            :class="{'btn-outline': store.statsRange !== range}"
            v-if="valid"
            @click="store.statsRange = range">
          {{ range }}
        </button>
      </div>
    </div>

    <DashboardGameLoadingSpinner :pending="playerPending" :error="playerError" />

    <apexchart v-if="playerStats && valid" height="200" width="550" :options="options" :series="series"></apexchart>
    <div v-if="playerStats && !valid" class="text-center">Not enough data</div>
  </div>
</template>

<style scoped>

</style>