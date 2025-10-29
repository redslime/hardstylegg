<script setup lang="ts">
import type {QuizContainer} from "~/types/gameModels";
import {getDashboardData, getScheduleForGame} from "~/utils/dashboard";
import type {ScheduleDay} from "~/types/models";

const emit = defineEmits(['clicked'])
const { quiz } = defineProps({
  quiz: { type: Object as PropType<QuizContainer>, required: true }
})
const dashboardData = await getDashboardData()
const scheduleData: ScheduleDay | undefined = getScheduleForGame(7, quiz.id!!)
const editor = dashboardData.editors.find(e => e.id === quiz.created_by)
</script>

<template>
  <div class="bg-base-200 p-3 max-w-[600px] rounded-lg cursor-pointer" @click="emit('clicked')">
    <div class="text-2xl font-bold">{{ quiz.title }}</div>
    <div class="flex flex-wrap gap-1 mb-4">
      <div class="badge badge-success badge-soft badge-xs font-mono" v-if="scheduleData">Scheduled: {{ scheduleData.dayFriendly }}</div>
      <div class="badge badge-neutral badge-xs font-mono">ID: {{ quiz.id }}</div>
      <div class="badge badge-neutral badge-xs font-mono">
        Created by {{ editor?.name }}
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <div v-for="item in quiz.items" :key="item.id" class="badge badge-outline"
           :class="{
              'badge-success': item.correct,
              'badge-error': !item.correct
            }">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>