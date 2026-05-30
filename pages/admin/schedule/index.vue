<script setup lang="ts">
import CalendarDaysIcon from "~/components/icons/CalendarDaysIcon.vue";
import {getDashboardData, getFriendlyName} from "~/utils/dashboard";
import {type ScheduleDay} from "~/types/models";
import DashboardScheduleDaySummary from "~/components/dashboard/DashboardScheduleDaySummary.vue";

definePageMeta({
  middleware: ['authenticated-admin'],
})

const dashboardData = await getDashboardData();
const schedule = dashboardData.schedule;
const days = ref<ScheduleDay[]>(schedule.days)

async function addEmptyDay() {
  const lastDay = days.value[days.value.length - 1]
  const newId = (lastDay?.day ?? 0) + 1
  const dayFriendly = await getFriendlyName(newId)

  days.value.push({
    day: newId,
    dayFriendly: dayFriendly,
    gameIds: [],
    typeIds: []
  })
}

useOnce(async () => {
  for(let i = 0; i < 3; i++) {
    await addEmptyDay()
  }

  // make sure today is always in the schedule
  // (shouldnt really happen unless the schedule was forgotten about for a few days)
  const todayId = schedule.todayId

  if(days.value.filter(d => d.day === todayId).length === 0) {
    days.value.push({
      day: todayId,
      dayFriendly: await getFriendlyName(todayId),
      gameIds: [],
      typeIds: []
    })
  }
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CalendarDaysIcon class="size-8" /></span>
    Schedule
  </div>

  <div v-if="schedule">
    <div class="flex flex-col gap-3">
      <template v-for="day in days" :key="day.day">
        <div class="flex">
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
            <DashboardScheduleDaySummary :day="day" :schedule="schedule" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>