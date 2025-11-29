<script setup lang="ts">
import type {CompleteAlbumContainer, CompleteAlbumItem} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<CompleteAlbumContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

function getPercentage(item: CompleteAlbumItem) {
  const total = reports.length
  const successes = reports.flatMap(r => Object.entries(r.itemsCompleted)).filter(([id, clicked]) => item.id === parseInt(id) && clicked === true).length
  return `${Math.round(successes / total * 100)}%`
}
</script>

<template>
  <div class="flex justify-center">
    <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
      <li
          v-for="(item, index) in container.items"
          :key="item.name"
          class="flex items-center gap-3 py-2 px-3"
      >
        <div class="text-xl tabular-nums font-mono w-6 opacity-30">
          {{ index + 1 }}
        </div>

        <div class="flex-1 font-semibold">
          <div class="badge badge-outline badge-info badge-sm" v-if="item.hidden">
            {{ item.name }}
          </div>
          <div class="rounded-md" v-else>
            {{ item.name }}
          </div>

          <div class="text-xs opacity-60">{{ item.artist }}</div>
        </div>

        <div class="font-bold text-success" v-if="item.hidden">
          <p v-if="reports.length > 0">
            {{ getPercentage(item) }}
          </p>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>