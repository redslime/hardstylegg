<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
import type {TimelineContainer} from "~/types/gameModels";

const { container, reports } = defineProps<{
  container: TimelineContainer,
  reports: GameReportFlat[]
}>()
const goal = computed(() => container.goal)
</script>

<template>
  <div class="badge badge-outline badge-lg badge-info">{{ goal }}</div>
</template>

<style scoped>

</style>