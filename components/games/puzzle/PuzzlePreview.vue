<script setup lang="ts">
import type {PuzzleContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.PuzzleDef
const { instance, pointer = true } = defineProps<{
  instance: PuzzleContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div v-for="track in instance.tracks" :key="track.sid" class="badge badge-outline badge-info">{{ track.getDisplayName() }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>