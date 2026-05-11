<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'

const container = ref<HTMLElement | null>(null)
const visible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
      if(entry?.isIntersecting) {
        visible.value = true
      }
    })

  if(container.value) {
    observer.observe(container.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="container">
    <slot v-if="visible" />
  </div>
</template>