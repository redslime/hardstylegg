<script setup lang="ts">
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {getName} from "~/utils/tracks";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<CompleteLyricsContainer>, required: true },
  pointer: { type: Boolean, default: true }
})

function getLines(instance: CompleteLyricsContainer) {
  return instance.text.split('\n').map(lineText => {
    const regex = /\[\[(.+?)\]\]/g
    const parts: { isInput: boolean; text: string }[] = []

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
  <DashboardGamePreviewHeader :typeId="3" :pointer="pointer" :container="instance" :title="getName(instance.track)">
    <div class="whitespace-pre-wrap">
      <template v-for="(line, lineIndex) in getLines(instance)" :key="lineIndex">
        <p class="flex items-center gap-1">
          <template v-for="(part, i) in line.parts" :key="i">
            <template v-if="!part.isInput">
              <span>{{ part.text }}</span>
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
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>