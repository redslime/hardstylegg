<script setup lang="ts">
import type {PuzzleContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.PuzzleDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<PuzzleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div v-for="track in instance.tracks" :key="track.sid" class="badge badge-outline badge-info">{{ track.getDisplayName() }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>