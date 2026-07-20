<script setup lang="ts">
import type {CompleteLyricsContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.CompleteLyricsDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<CompleteLyricsContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="whitespace-pre-wrap">
      <template v-for="(line, lineIndex) in gameDef.getLines(instance)" :key="lineIndex">
        <p class="flex items-center gap-1">
          <template v-for="(part, i) in line.parts" :key="i">
            <template v-if="!part.isInput">
              <span>{{ part.text }}</span>
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
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>