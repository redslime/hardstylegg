<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
import type {TimetableContainer, TimetableItem} from "~/types/gameModels";
import TimetableGenerator from "~/components/games/timetable/TimetableGenerator.vue";

const { container, reports } = defineProps({
  container: { type: Object as PropType<TimetableContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

function getPercentage(item: TimetableItem) {
  const total = reports.length
  const successes = reports.flatMap(r => Object.entries(r.itemsCompleted)).filter(([id, clicked]) => item.id === parseInt(id) && clicked === true).length
  return `${Math.round(successes / total * 100)}%`
}
</script>

<template>
  <div class="min-w-[700px]">
    <TimetableGenerator :container="container" :items="container.items">
      <template #default="{ item }">
        <div class="w-full h-full cursor-pointer">
          <div class="text-lg font-bold">
            <div class="flex gap-2">
              {{ item.name }}

              <div class="font-bold" v-if="item.hidden">
              <span v-if="reports.length > 0">
                <span class="badge text-success">{{ getPercentage(item) }}</span>
              </span>
              <span v-else class="badge">
                <span class="loading loading-spinner loading-sm text-success"></span>
              </span>
              </div>
            </div>
          </div>
          <div class="text-xs opacity-80">
            {{ item.begin }} - {{ item.end }}
          </div>
        </div>
      </template>
    </TimetableGenerator>
  </div>
</template>

<style scoped>

</style>