<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<WordleContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
const letters = container.artist.name.split("")
</script>

<template>
  <div class="flex gap-1">
    <div v-for="letter in letters" class="w-8 h-8 text-xl bg-[#6aaa64] rounded-sm text-center text-white uppercase font-bold">
      {{ letter }}
    </div>
  </div>
</template>

<style scoped>

</style>