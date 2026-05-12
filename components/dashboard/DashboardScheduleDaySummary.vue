<script setup lang="ts">
import {type Schedule, type ScheduleDay} from "~/types/models";
import {GAMES_PER_DAY} from "~/utils/dashboard";
import {zipIds} from "~/utils/utils";

const { day, schedule } = defineProps({
  day: { type: Object as PropType<ScheduleDay>, required: true },
  schedule: { type: Object as PropType<Schedule>, required: true }
})
const isToday = computed(() => day.day === schedule.todayId);
const isReady = computed(() => day.gameIds.length === day.typeIds.length && day.gameIds.length >= GAMES_PER_DAY);
const isPlaying = computed(() => isToday.value && day.gameIds.length === day.typeIds.length && day.gameIds.length >= GAMES_PER_DAY);
const isUpcoming = computed(() => day.day > schedule.todayId);
</script>

<template>
  <div class="flex flex-col gap-2 h-full">
    <template v-if="isUpcoming || isToday">
      <div class="badge badge-sm badge-success" v-if="isReady">Ready</div>
      <div class="badge badge-sm badge-info" v-else-if="isPlaying">Playing</div>
      <div class="badge badge-sm badge-error" v-else>Not ready</div>
    </template>

    <div class="text-xl font-medium text-secondary mb-2" v-if="day.theme">
      {{ day.theme }}
    </div>

    <div class="flex gap-2">
      <GameIconRow :gameIds="zipIds(day.typeIds, day.gameIds)" :style="'bg-black/50'" />
    </div>
    <div class="flex flex-row gap-3" v-if="isUpcoming || (isToday && !isReady)" >
      <button class="btn btn-primary btn-soft" @click="navigateTo('/admin/schedule/' + day.day)">
        Edit
      </button>
    </div>
    <div class="flex flex-row gap-3" v-else>
      <button class="btn btn-primary btn-soft" @click="navigateTo('/admin/schedule/' + day.day)">
        View
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>