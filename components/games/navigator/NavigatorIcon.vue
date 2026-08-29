<script setup lang="ts">
import {GameState} from "~/types/models";
import {getStrokeColor} from "~/utils/icons";

const { state, size = 6 } = defineProps<{
  state?: GameState
  size?: number
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" :class="`size-${size}`" :style="{'stroke': getStrokeColor(state)}">
    <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="M21,12c0,4.97-4.03,9-9,9S3,16.97,3,12,7.03,3,12,3s9,4.03,9,9Z"/>
    <path :style="{'fill': getStrokeColor(state)}" stroke-linecap="round" stroke-linejoin="round" d="M11.02,11.26l-2.44,4.16,4.16-2.44c.1-.06.18-.14.24-.24l2.44-4.16-4.16,2.44c-.1.06-.18.14-.24.24Z"/>
  </svg>
</template>

<style scoped>

</style>