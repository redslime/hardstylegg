<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";
import WordleString from "~/components/games/wordle/WordleString.vue";

const { container, reports } = defineProps({
  container: { type: Object as PropType<WordleContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <WordleString :guess="container.artist.name" :solution="container.artist.name" />
</template>

<style scoped>

</style>