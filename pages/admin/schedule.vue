<script setup lang="ts">
import CalendarDaysIcon from "~/components/icons/CalendarDaysIcon.vue";
import {getDashboardData} from "~/utils/dashboard";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const dashboardData = await getDashboardData();
const schedule = dashboardData.schedule;
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CalendarDaysIcon class="size-8" /></span>
    Schedule
  </div>

  <div v-if="schedule">
    <div class="flex flex-col gap-3">
      <template v-for="day in schedule.days" :key="day.day">
        <div class="flex h-40">
          <div class="w-40 text-center content-center  rounded-l-lg"
              :class="{
                 'bg-black/70': day.day !== schedule.todayId,
                 'bg-primary': day.day === schedule.todayId
          }">
            <h1 class="text-3xl font-bold" :class="{'text-primary-content': day.day === schedule.todayId}">
              {{ day.dayFriendly }}
            </h1>
            <p v-if="day.day === schedule.todayId" class="text-primary-content">
              Active
            </p>
            <p v-if="day.day === schedule.todayId+1">
              Starts: <Countdown />
            </p>
          </div>
          <div class="w-full bg-base-200 p-3 rounded-r-lg">
            moini
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>