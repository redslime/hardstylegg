<script setup lang="ts">

import {getDashboardData, getFriendlyName} from "~/utils/dashboard";
import {gameComps, getGameName} from "~/utils/game";
import {GameState} from "~/types/models";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = await useUserSession()
const dashboard = await getDashboardData()
const schedule = dashboard.schedule
const friendly = await getFriendlyName(schedule.todayId, "LLLL d")
const tomorrowSchedule = schedule.days.find(d => d.day === schedule.todayId + 1)
const tomorrowReady = tomorrowSchedule && tomorrowSchedule.gameIds.length > 0
const daysAhead = schedule.days.filter(d => d.day > schedule.todayId).filter(d => d.gameIds.length > 0).length

function getTypeIds(day: number) {
  const daySchedule = schedule.days.find(d => d.day === day)
  if (daySchedule) {
    return daySchedule.typeIds
  }
  return []
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="bg-primary text-primary-content p-5 rounded-md">
      <h1 class="text-5xl font-bold mb-5">{{ friendly }}</h1>

      <div class="flex p-2 divide-x-2 divide-black/50 divide-dashed">
        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Games</p>

          <div class="flex gap-2">
            <div v-for="(typeId, index) in getTypeIds(schedule.todayId)" :key="index" class="p-3 rounded-md tooltip bg-base-100"
                 :data-tip="getGameName(typeId)">
              <component :is="gameComps[getGameName(typeId) as keyof typeof gameComps].icon" :state="GameState.UPCOMING" />
            </div>
          </div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Time left</p>
          <div class="text-3xl font-bold"><Countdown /></div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Times Played</p>
          <div class="text-3xl font-bold">14</div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Completion Rate</p>
          <div class="text-3xl font-bold">75%</div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Average Score</p>
          <div class="text-3xl font-bold">3.4/5</div>
        </div>
      </div>
    </div>

    <div class="flex gap-5">
      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Tomorrow</h1>

        <div class="flex flex-col gap-3 items-center">
          <div class="flex gap-2">
            Status:
            <div class="badge badge-soft badge-success" v-if="tomorrowReady">Ready</div>
            <div class="badge badge-soft badge-error" v-else>Not ready</div>
          </div>

          <div class="flex gap-2">
            <div v-if="tomorrowSchedule" v-for="(typeId, index) in tomorrowSchedule.typeIds" :key="index" class="p-2 rounded-md tooltip bg-black/50"
                 :data-tip="getGameName(typeId)">
              <component :size="4" :is="gameComps[getGameName(typeId) as keyof typeof gameComps].icon" :state="GameState.UPCOMING" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Schedule overview</h1>

        <div class="flex gap-2">
          Days scheduled ahead: <div class="badge badge-soft badge-info">{{ daysAhead }}</div>
        </div>

        <button class="btn btn-primary mt-5 btn-outline btn-sm" v-if="user.admin" @click="navigateTo('/admin/schedule')">
          Go to schedule
        </button>
      </div>
    </div>
  </div>
</template>
