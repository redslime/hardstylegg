<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<WordleContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <div class="badge badge-outline badge-info">{{ container.artist.name }}</div>
</template>

<style scoped>

</style>