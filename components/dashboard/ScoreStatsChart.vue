<script setup lang="ts">
import type {AvgScoresContainer} from "~/types/models";
import type {ApexOptions} from "apexcharts";

const { data, pending, error } = useFetch<AvgScoresContainer>("/api/scores")

let options = reactive<ApexOptions>({})
let series = reactive([{}])
const valid = computed(() => data.value && data.value.dayIds.length > 0)

watch(data, (d) => {
  if(!d) return

  options = {
    theme: {
      mode: 'dark',
      palette: 'palette1'
    },
    chart: {
      id: 'performance',
      background: 'transparent',
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
    xaxis: {
      categories: d.dayNames,
    },
    yaxis: {
      min: 0,
      max: 5,
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        formatter: (val: number) => `${val}`
      }
    },
    markers: {
      size: 3
    },
    tooltip: {
      enabled: true
    },
    stroke: {
      curve: 'smooth',
      dashArray: [0, 5],
      width: [4, 3],
    },
    legend: {
      showForNullSeries: false,
      onItemClick: {
        toggleDataSeries: false
      }
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

  series = [
    {
      name: 'Average score',
      data: d.avg
    }
  ]
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <apexchart v-if="data && valid" height="200" width="550" :options="options" :series="series"></apexchart>
  <div v-if="data && !valid" class="text-center">Not enough data</div>
</template>

<style scoped>

</style>