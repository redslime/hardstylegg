<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
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
    <ul class="grid bg-base-100 rounded-box shadow-md divide-y divide-base-300 text-sm"
        :class="{ 'grid-cols-2': container.items.items.length >= 10 }">
      <template v-if="container.items.type === 'track' || container.items.type === 'album'">
        <li
            v-for="(content, index) in container.items.items"
            :key="content.sid"
            class="relative flex items-center gap-3 py-2 px-3"
        >
          <div class="text-xl tabular-nums font-mono w-6 opacity-30">
            {{ index + 1 }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 font-semibold">
              {{ content.title }}
            </div>

            <div class="text-xs opacity-60">
              {{ content.getArtistsString() }}
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
      <template v-else-if="container.items.type === 'artist'">
        <li
            v-for="(item, index) in container.items.items"
            :key="item.id"
            class="relative flex items-center gap-3 py-2 px-3"
        >
          <div class="text-xl tabular-nums font-mono w-6 opacity-30">
            {{ index + 1 }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 font-semibold">
              {{ item.getDisplayName() }}
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
            v-for="(item, index) in container.items.items as string[]"
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