<script setup lang="ts">
import type {CompleteLyricsContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";
import InfoIcon from "~/components/icons/InfoIcon.vue";

const { container, reports } = defineProps({
  container: { type: Object as PropType<CompleteLyricsContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

interface LinePart { isInput: boolean; text: string }

function getLines(instance: CompleteLyricsContainer) {
  return instance.text.split('\n').map(lineText => {
    const regex = /\[\[(.+?)\]\]/g
    const parts: LinePart[] = []

    lineText.split(' ').forEach(word => {
      if (regex.test(word)) {
        parts.push({ isInput: true, text: word.replace(regex, '$1') })
      } else {
        parts.push({ isInput: false, text: word })
      }
    })

    return {parts}
  })
}
</script>

<template>
  <div class="whitespace-pre-wrap">
    <template v-for="(line, lineIndex) in getLines(container)" :key="lineIndex">
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
          </template>
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>

</style>