<script setup lang="ts">
import type {TimelineContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimelineDef
const { instance, pointer = true } = defineProps<{
  instance: TimelineContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ instance.goal }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>