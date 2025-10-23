<script setup lang="ts">
import {GameState} from "~/types/models";
import {getStrokeColor} from "~/utils/icons";

const props = defineProps({
  state: { type: Number as PropType<GameState>, required: false },
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"
       :style="{'stroke': getStrokeColor(props.state)}" >
    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
</template>

<style scoped>
</style>