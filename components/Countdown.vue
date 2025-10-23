<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const { seconds: s } = await $fetch<{ seconds: number }>('/api/time')

let secondsUntilMidnight = s
const hours = ref("")
const minutes = ref("")
const seconds = ref("")
let interval: ReturnType<typeof setInterval>

const updateCountdown = () => {
  secondsUntilMidnight--
  const diff = secondsUntilMidnight * 1000

  hours.value = `${Math.floor(diff / 1000 / 60 / 60)}`
  minutes.value =`${Math.floor((diff / 1000 / 60) % 60)}`.padStart(2, '0')
  seconds.value =`${Math.floor((diff / 1000) % 60)}`.padStart(2, '0')
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>


<template>
  <span class="countdown font-mono">
    <span :style="`--value:${hours}`" aria-live="polite" :aria-label="hours">{{ hours }}</span>
    :
    <span :style="`--value:${minutes}; --digits: 2;`" aria-live="polite" :aria-label="minutes">{{ minutes }}</span>
    :
    <span :style="`--value:${seconds}; --digits: 2;`" aria-live="polite" :aria-label="seconds">{{ seconds }}</span>
  </span>
</template>

<style scoped>

</style>