<script setup lang="ts">
import type {TimelineContainer} from "~/types/gameModels";
import {getDashboardData, getScheduleForGame} from "~/utils/dashboard";
import type {ScheduleDay} from "~/types/models";

const emit = defineEmits(['clicked'])
const { timeline } = defineProps({
  timeline: { type: Object as PropType<TimelineContainer>, required: true }
})
const dashboardData = await getDashboardData()
const scheduleData: ScheduleDay | undefined = getScheduleForGame(8, timeline.id!!)
const editor = dashboardData.editors.find(e => e.id === timeline.created_by)
</script>

<template>
  <div class="bg-base-200 p-3 max-w-[600px] rounded-lg cursor-pointer" @click="emit('clicked')">
    <div class="text-2xl font-bold">{{ timeline.title }}</div>
    <div class="flex flex-wrap gap-1 mb-4">
      <div class="badge badge-success badge-soft badge-xs font-mono" v-if="scheduleData">Scheduled: {{ scheduleData.dayFriendly }}</div>
      <div class="badge badge-neutral badge-xs font-mono">ID: {{ timeline.id }}</div>
      <div class="badge badge-neutral badge-xs font-mono">
        Created by {{ editor?.name }}
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <div class="badge badge-outline badge-success">{{ timeline.goal }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>