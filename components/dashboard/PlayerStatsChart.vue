<script setup lang="ts">
type Response = Record<number, { dayFriendly: string, played: number; completed: number; }>
const { data, pending, error } = useFetch<Response>("/api/dashboard/stats/players")

let options = reactive({})
let series = reactive([{}])
const valid = computed(() => data.value && Object.keys(data.value).length > 0)

watch(data, (d: Response | undefined) => {
  if(!d) return

  options = {
    theme: {
      mode: 'dark',
      palette: 'palette1'
    },
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
    xaxis: {
      categories: Object.values(d).map(v => v.dayFriendly),
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val
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

  const startedData = Object.values(d).map(v => v.played)
  const completedData = Object.values(d).map(v => v.completed)

  series = [
    {
      name: 'Started',
      data: startedData
    },
    {
      name: 'Completed',
      data: completedData
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