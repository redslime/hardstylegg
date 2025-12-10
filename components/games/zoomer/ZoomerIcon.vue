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
    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
  </svg>
</template>

<style scoped>

</style>