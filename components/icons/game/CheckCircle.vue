<script setup lang="ts">
import {GameState} from "~/types/models";
import {getStrokeColor} from "~/utils/icons";

const props = defineProps({
  state: { type: Number as PropType<GameState>, required: false },
  size: { type: Number, required: false, default: 6 }
})

const size = computed(() => "size-" + props.size)
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="size"
       :style="{'stroke': getStrokeColor(props.state)}" >
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
</template>

<style scoped>
</style>