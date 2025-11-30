<script setup lang="ts">
import {onBeforeUnmount, ref} from 'vue'
import {watchOnce} from "@vueuse/shared";

const { data: s, clear } = await useAsyncData<{ seconds: number }>(`${Date.now()}`, () => $fetch('/api/time'), { lazy: true })

let secondsUntilMidnight = 0
const hours = ref("")
const minutes = ref("")
const seconds = ref("")
let interval: ReturnType<typeof setInterval>
const loaded = ref(false)

const updateCountdown = () => {
  secondsUntilMidnight--
  const diff = secondsUntilMidnight * 1000

  hours.value = `${Math.floor(diff / 1000 / 60 / 60)}`
  minutes.value =`${Math.floor((diff / 1000 / 60) % 60)}`.padStart(2, '0')
  seconds.value =`${Math.floor((diff / 1000) % 60)}`.padStart(2, '0')
}

onBeforeUnmount(() => {
  clear()
  clearInterval(interval)
})

watchOnce(s, val => {
  secondsUntilMidnight = val?.seconds ?? 0
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
  loaded.value = true
})
</script>

<template>
  <span v-if="!loaded" class="loading loading-infinity"></span>
  <span v-else class="countdown font-mono">
    <span :style="`--value:${hours}`" aria-live="polite" :aria-label="hours">{{ hours }}</span>
    :
    <span :style="`--value:${minutes}; --digits: 2;`" aria-live="polite" :aria-label="minutes">{{ minutes }}</span>
    :
    <span :style="`--value:${seconds}; --digits: 2;`" aria-live="polite" :aria-label="seconds">{{ seconds }}</span>
  </span>
</template>

<style scoped>

</style>