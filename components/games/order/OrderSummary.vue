<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
import type {OrderContainer} from "~/types/gameModels";

const { container, reports } = defineProps({
  container: { type: Object as PropType<OrderContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

function getPercentage(index: number) {
  const total = reports.length
  const successes = reports.flatMap(r => Object.entries(r.itemsCompleted)).filter(([id, clicked]) => index === parseInt(id) && clicked === true).length
  return `${Math.round(successes / total * 100)}%`
}
</script>

<template>
  <div class="w-full flex gap-2 max-w-[600px]">
    <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2" v-for="(item, index) in container.items" :key="item.track.sid">
      <div class="flex flex-col items-center gap-2">
        <img
            :src="`${getSpotifyArtwork(item.track.cover_art)}`"
            :alt="item.track.title"
            class="w-full h-auto rounded-xl shrink shadow-md"
        />

        <div class="font-bold text-success">
          <p v-if="reports.length > 0">
            {{ getPercentage(index as number) }}
          </p>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>