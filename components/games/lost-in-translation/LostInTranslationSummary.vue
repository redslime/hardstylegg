<script setup lang="ts">
import type {LostInTranslationContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<LostInTranslationContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <div class="flex gap-3 w-full">
    <fieldset class="fieldset mt-2 w-1/2">
      <legend class="fieldset-legend">Original lyrics</legend>
      <textarea class="textarea w-full" rows="20" placeholder="Enter original lyrics..." :value="container.textOriginal" readonly></textarea>
    </fieldset>
    <fieldset class="fieldset mt-2 w-1/2">
      <legend class="fieldset-legend">Translated lyrics</legend>
      <textarea class="textarea w-full" rows="20" placeholder="Enter translated lyrics..." :value="container.textTranslated" readonly></textarea>
    </fieldset>
  </div>

  <fieldset class="fieldset mt-2 w-full">
    <legend class="fieldset-legend">Translation chain</legend>
    <input type="text" class="input w-full" placeholder="English ➔ ..." :value="container.translationChain" readonly />
  </fieldset>
</template>

<style scoped>
</style>