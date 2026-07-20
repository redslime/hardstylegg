<script setup lang="ts">
import type {CompleteLyricsContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.CompleteLyricsDef
const { container, reports } = defineProps({
  container: { type: Object as PropType<CompleteLyricsContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <div class="whitespace-pre-wrap">
    <template v-for="(line, lineIndex) in gameDef.getLines(container)" :key="lineIndex">
      <p class="flex items-center gap-1">
        <template v-for="(part, i) in line.parts" :key="i">
          <template v-if="!part.isInput">
                  <span class="rounded-md">
                    {{ part.text }}
                  </span>
          </template>

          <template v-else>
            <span class="badge badge-outline badge-info badge-sm">
              {{ part.text }}
            </span>
            <span class="-ml-1" v-if="part.suffix">
              {{ part.suffix }}
            </span>
          </template>
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>

</style>