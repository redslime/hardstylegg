<script setup lang="ts">

import {getDashboardData, getFriendlyName} from "~/utils/dashboard";
import PlayerStatsChart from "~/components/dashboard/PlayerStatsChart.vue";
import ScoreStatsChart from "~/components/dashboard/ScoreStatsChart.vue";
import {zipIds} from "~/utils/utils";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = await useUserSession()
const dashboard = await getDashboardData()
const schedule = dashboard.schedule
const todayData = schedule.days.find(d => d.day === schedule.todayId)
const friendly = await getFriendlyName(schedule.todayId, "LLLL d")
const timesPlayed = computed<number>(() => dashboard.reports.timesPlayed)
const completionRate = computed<number>(() => dashboard.reports.completionRate)
const averageScore = computed<number>(() => dashboard.reports.avgScore)
const gameCount = todayData?.gameIds.length ?? 0
const tomorrowSchedule = schedule.days.find(d => d.day === schedule.todayId + 1)
const tomorrowReady = tomorrowSchedule && tomorrowSchedule.gameIds.length > 0
const daysAhead = schedule.days.filter(d => d.day > schedule.todayId).filter(d => d.gameIds.length > 0).length

function getIconIds(day: number): { typeId: number, gameId: number }[] {
  const daySchedule = schedule.days.find(d => d.day === day)
  if (daySchedule) {
    return zipIds(daySchedule.typeIds, daySchedule.gameIds)
  }
  return []
}

function getGamePerformance(typeId: number, gameId: number): number | undefined {
  if(todayData?.gameIds && todayData?.typeIds) {
    return dashboard.reports.games.find(i => i.typeId === typeId && i.gameId === gameId)?.percent
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="bg-primary text-primary-content p-5 rounded-md">
      <h1 class="text-5xl font-bold mb-5">
        {{ friendly }}
        <span class="font-medium" v-if="todayData?.theme">({{ todayData.theme }})</span>
      </h1>

      <div class="flex p-2 divide-x-2 divide-black/50 divide-dashed">
        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Games</p>

          <div class="flex gap-2">
            <GameIconRow :gameIds="getIconIds(schedule.todayId)">
              <template #ids="{ typeId, gameId }">
                <p class="font-semibold text-sm" v-if="getGamePerformance(typeId, gameId)">
                  {{ getGamePerformance(typeId, gameId) ?? 0 }}%
                </p>
              </template>
            </GameIconRow>
          </div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Time left</p>
          <div class="text-3xl font-bold"><Countdown /></div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center">
          <p class="uppercase font-semibold font-sm">Times Played</p>
          <div class="text-3xl font-bold">{{ timesPlayed }}</div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center" v-if="timesPlayed > 0">
          <p class="font-sm tooltip" :data-tip="'Rate of players finishing all ' + gameCount + ' of today\'s games'">
            <span class="uppercase font-semibold">Completion Rate </span>
            <span class="bg-neutral/50 text-neutral-content rounded-full px-1.5">?</span>
          </p>
          <div class="text-3xl font-bold">{{ completionRate }}%</div>
        </div>

        <div class="flex flex-col p-3 gap-2 items-center" v-if="timesPlayed > 0">
          <p class="font-sm tooltip" data-tip="Average score of completed games">
            <span class="uppercase font-semibold">Average Score </span>
            <span class="bg-neutral/50 text-neutral-content rounded-full px-1.5">?</span>
          </p>
          <div class="text-3xl font-bold">{{ averageScore }}/{{ gameCount }}</div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-5">
      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Tomorrow</h1>

        <div class="flex flex-col gap-3 items-center">
          <div class="flex gap-2">
            Status:
            <div class="badge badge-soft badge-success" v-if="tomorrowReady">Ready</div>
            <div class="badge badge-soft badge-error" v-else>Not ready</div>
          </div>

          <div class="flex gap-2" v-if="tomorrowSchedule">
            <GameIconRow :gameIds="getIconIds(tomorrowSchedule.day)" :iconSize="4" />
          </div>
        </div>

        <button class="btn btn-primary mt-2 btn-outline btn-sm" v-if="user.admin && !tomorrowReady" @click="navigateTo('/admin/schedule/' + (schedule.todayId + 1))">
          Edit now
        </button>
      </div>

      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Schedule overview</h1>

        <div class="flex gap-2">
          Days scheduled ahead: <div class="badge badge-soft badge-info">{{ daysAhead }}</div>
        </div>

        <div class="flex flex-wrap gap-1 justify-center">
          <button class="btn btn-primary mt-5 btn-outline btn-sm" v-if="user.admin" @click="navigateTo('/admin/schedule/' + schedule.todayId)">
            Go to today
          </button>
          <button class="btn btn-primary mt-5 btn-outline btn-sm" v-if="user.admin" @click="navigateTo('/admin/schedule')">
            Go to schedule
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-5">
      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Player stats</h1>
        <PlayerStatsChart />
      </div>

      <div class="bg-base-200 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Average Score stats</h1>
        <ScoreStatsChart />
      </div>
    </div>

    <div class="flex gap-5" v-if="!user.admin">
      <div class="bg-secondary/30 p-7 rounded-md">
        <h1 class="text-2xl font-bold mb-5 text-center">Welcome, {{ user.name }}</h1>

        <p>This is the dashboard with some fun overview stats.</p>
        <p>On the left handside you can navigate to different game dashboards,</p>
        <p>from where you can create new games and edit your own.</p>
        <p>An admin (redje) can then schedule your creation for an upcoming</p>
        <p>challenge, which is also visible on the preview for your information.</p>
        <p>Once a game is scheduled, it can no longer be edited or deleted.</p>
        <br>
        <p>Much of this dashboard is still pretty barebones and sometimes buggy,</p>
        <p>if you run into any issues please first try reloading the page once,</p>
        <p>otherwise just let me know, of course.</p>
        <br>
        <p>Oh yeah and this is probably pretty atrocious to use on mobile lmao</p>
      </div>
    </div>
  </div>
</template>
