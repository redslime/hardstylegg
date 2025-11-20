<script setup lang="ts">
import type {AvgScoresContainer, CookieDayMemory} from "~/types/models";

const { scores, cookie } = defineProps({
  scores: { type: Object as PropType<AvgScoresContainer>, required: true },
  cookie: { type: Object as PropType<CookieDayMemory[]>, required: true }
})

const userScores = scores.dayIds.map(id => {
  const day = cookie.find(c => c.day === id)

  if(day) {
    return day.data.filter(d => d).length
  } else {
    return null
  }
})

const options = {
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
    categories: scores.dayNames,
  },
  yaxis: {
    min: 0,
    max: 5,
    tickAmount: 5,
    forceNiceScale: true,
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

const series = [
  {
    name: 'Your score',
    data: userScores
  },
  {
    name: 'Average score',
    data: scores.avg
  }
]
</script>

<template>
  <div>
    <apexchart width="500" type="line" :options="options" :series="series"></apexchart>
  </div>
</template>

<style scoped>

</style>