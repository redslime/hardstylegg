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
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
</template>

<style scoped>

</style>