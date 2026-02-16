<script setup lang="ts">
import {INFINITY_END_YEAR, INFINITY_START_YEAR} from "~/utils/infinity";

const start = defineModel<number>('start', { required: true, default: INFINITY_START_YEAR })
const end = defineModel<number>('end', { required: true, default: INFINITY_END_YEAR })

const minYear = INFINITY_START_YEAR
const maxYear = INFINITY_END_YEAR

watch(start, val => {
  if(val > end.value) {
    start.value = end.value
  }
})

watch(end, val => {
  if(val < start.value) {
    end.value = start.value
  }
})
</script>

<template>
  <div class="flex flex-col w-full max-w-md mx-auto p-4">
    <div class="relative h-16 flex items-end pb-2">
      <div 
        class="absolute top-0 -translate-x-1/2 mb-2"
        :style="{ left: `${((start - minYear) / (maxYear - minYear)) * 100}%` }"
      >
        <span class="badge badge-primary shadow-sm font-semibold">{{ start }}</span>
      </div>

      <div 
        class="absolute top-0 -translate-x-1/2 mb-2"
        :style="{ left: `${((end - minYear) / (maxYear - minYear)) * 100}%` }"
      >
        <span class="badge badge-primary shadow-sm font-semibold">{{ end }}</span>
      </div>

      <div class="relative w-full h-6 flex items-center">
        <div class="absolute w-full h-2 bg-primary/20 rounded-full"></div>

        <div 
          class="absolute h-2 bg-primary rounded-full"
          :style="{
            left: `${((start - minYear) / (maxYear - minYear)) * 100}%`,
            right: `${100 - ((end - minYear) / (maxYear - minYear)) * 100}%`
          }"
        ></div>

        <input
          type="range"
          :min="minYear"
          :max="maxYear"
          v-model="start"
          class="range-input absolute w-full bg-transparent appearance-none pointer-events-none z-20"
        />

        <input
          type="range"
          :min="minYear"
          :max="maxYear"
          v-model="end"
          class="range-input absolute w-full bg-transparent appearance-none pointer-events-none z-10"
        />
      </div>
    </div>

    <div class="flex justify-between text-xs text-base-content/50">
      <span>{{ minYear }}</span>
      <span>{{ maxYear }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/main.css";

.range-input::-webkit-slider-thumb {
  @apply pointer-events-auto appearance-none w-6 h-6 rounded-full bg-primary-content border-5 border-primary cursor-pointer shadow-md;
}

.range-input::-moz-range-thumb {
  @apply pointer-events-auto appearance-none w-6 h-6 rounded-full bg-primary-content border-5 border-primary cursor-pointer shadow-md;
}

/* Ensure the range inputs don't have default backgrounds */
.range-input {
  -webkit-appearance: none;
  appearance: none;
}

.range-input:focus {
  outline: none;
}
</style>