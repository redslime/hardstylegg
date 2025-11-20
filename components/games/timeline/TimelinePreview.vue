<script setup lang="ts">
import type {TimelineContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimelineDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<TimelineContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ instance.goal }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>