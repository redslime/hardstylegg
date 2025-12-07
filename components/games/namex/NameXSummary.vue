<script setup lang="ts">
import type {GameReportFlat, Track} from "~/types/models";
import type {NameXContainer} from "~/types/gameModels";

const { container, reports } = defineProps({
  container: { type: Object as PropType<NameXContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

function getPercentage(index: number) {
  const total = reports.length
  const successes = reports.flatMap(r => Object.entries(r.itemsCompleted)).filter(([id, clicked]) => index === parseInt(id) && clicked === true).length
  return `${Math.round(successes / total * 100)}%`
}
</script>

<template>
  <div class="flex justify-center">
    <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
      <template v-if="container.tracks">
        <li
            v-for="(track, index) in container.items as Track[]"
            :key="track.sid"
            class="relative flex items-center gap-3 py-2 px-3"
        >
          <div class="text-xl tabular-nums font-mono w-6 opacity-30">
            {{ index + 1 }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 font-semibold">
              {{ track.title }}
            </div>

            <div class="text-xs opacity-60">
              {{ track.artists }}
            </div>
          </div>

          <div class="font-bold text-success">
            <p v-if="reports.length > 0">
              {{ getPercentage(index as number) }}
            </p>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </div>
        </li>
      </template>
      <template v-else>
        <li
            v-for="(item, index) in container.items as string[]"
            :key="item"
            class="relative flex items-center gap-3 py-2 px-3"
        >
          <div class="text-xl tabular-nums font-mono w-6 opacity-30">
            {{ index + 1 }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 font-semibold">
              {{ item }}
            </div>
          </div>

          <div class="font-bold text-success">
            <p v-if="reports.length > 0">
              {{ getPercentage(index as number) }}
            </p>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>

</style>