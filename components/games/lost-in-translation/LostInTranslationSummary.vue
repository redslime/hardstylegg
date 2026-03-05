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
      <div class="border border-white/15 p-3 text-md rounded-md whitespace-pre-line bg-base-100 text-xmd">
        {{ container.textOriginal }}
      </div>
    </fieldset>
    <fieldset class="fieldset mt-2 w-1/2">
      <legend class="fieldset-legend">Translated lyrics</legend>
      <div class="border border-white/15 p-3 text-md rounded-md whitespace-pre-line bg-base-100 text-xmd">
        {{ container.textTranslated }}
      </div>
    </fieldset>
  </div>

  <fieldset class="fieldset mt-2 w-full">
    <legend class="fieldset-legend">Translation chain</legend>
    <div class="border border-white/15 p-3 text-md rounded-md bg-base-100 text-xmd">
      {{ container.translationChain }}
    </div>
  </fieldset>
</template>

<style scoped>
.text-xmd {
  font-size: 14px;
}
</style>