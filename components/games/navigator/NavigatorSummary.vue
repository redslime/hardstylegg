<script setup lang="ts">
import type {NavigatorContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps<{
  container: NavigatorContainer,
  reports: GameReportFlat[]
}>()
</script>

<template>

</template>

<style scoped>

</style>