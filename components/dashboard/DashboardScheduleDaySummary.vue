<script setup lang="ts">
import {GameState, type Schedule, type ScheduleDay} from "~/types/models";
import {gameComps, getGameName} from "~/utils/game";
import {GAMES_PER_DAY} from "~/utils/dashboard";

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
    <div class="flex gap-2">
      <div v-for="game in day.typeIds" :key="game" class="p-3 rounded-md tooltip bg-black/50"
           :data-tip="getGameName(game)">
        <component :is="gameComps[getGameName(game) as keyof typeof gameComps].icon" :state="GameState.UPCOMING" />
      </div>
    </div>
    <div class="flex flex-row gap-3" v-if="isUpcoming || (isToday && !isReady)" >
      <button class="btn btn-primary btn-soft"@click="navigateTo('/admin/schedule/' + day.day)">
        Edit
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>