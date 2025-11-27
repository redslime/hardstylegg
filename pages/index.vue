<script setup lang="ts">
import {getGameContainer, hasPlayedToday} from "~/utils/game";
import {type AvgScoresContainer, type CookieDayMemory, type GameContainer, GameState} from "~/types/models";
import {getTracks} from "~/utils/tracks";
import {refreshCookie} from "#app";
import CookieChart from "~/components/CookieChart.vue";
import {watchOnce} from "@vueuse/shared";
import {getYesterdayGame} from "~/utils/archive";

definePageMeta({
  layout: 'hero'
})

const { data: gameData, pending } = await useAsyncData(() => getGameContainer(), { lazy: true })
const { data: avgScores } = await useAsyncData(() => $fetch<AvgScoresContainer>('/api/scores'), { lazy: true })
const gameDataPast = ref<GameContainer>()
const cookie = useCookie<CookieDayMemory[]>("memory", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "strict",
  default: () => []
})
const exists = computed(() => gameData.value !== undefined && gameData.value.dayId !== -1)
const played = computed(() => hasPlayedToday(cookie.value, gameData.value?.dayId))
const dataToday = computed(() => cookie.value?.find(d => d.day === gameData.value?.dayId)?.data)
const dev = import.meta.env.DEV

function getState(index: number): GameState {
  if(dataToday.value === undefined) {
    return GameState.UPCOMING
  } else {
    return dataToday.value[index] ? GameState.SUCCEEDED : GameState.FAILED
  }
}

async function play() {
  navigateTo('/play')
}

function navigateArchive() {
  navigateTo('/archive')
}

watchOnce(gameData, async (val) => {
  if(val === undefined) return
  gameDataPast.value = await getYesterdayGame()
})

onMounted(() => {
  refreshCookie("memory")
})

useOnce(() => {
  getTracks().then(() => {})
})
</script>

<template>
  <div class="hero bg-base-300 rounded-lg border-1 border-primary">
    <div class="hero-content flex flex-col text-center">
      <div class="max-w-lg">
        <h1 class="text-3xl md:text-5xl font-bold">Daily challenge</h1>
        <h2 v-if="gameData && gameData.theme" class="text-xl md:text-2xl mt-1 text-secondary font-medium">{{ gameData.theme }}</h2>
        <h4 class="text-xl mt-2" v-if="gameData">{{ gameData.dayFriendly }}</h4>
      </div>

      <template v-if="pending">
        <span class="loading loading-spinner loading-xl"></span>
      </template>
      <template v-else-if="gameData && exists">
        <div class="flex justify-center flex-wrap gap-2 mb-3">
          <GameIconRow :games="gameData.data" :getState="getState" />
        </div>
        <button class="btn btn-primary btn-xl" v-if="!played" @click="play">Play</button>

        <div class="text-lg" v-if="played">
          You already played today! Next challenge starts in <Countdown />
        </div>
      </template>
      <template v-else>
        <div class="max-w-md">
          <h4 class="text-xl mt-2">Nothing to play right now, check back later!</h4>
        </div>
      </template>
    </div>
  </div>

  <div class="hero bg-base-300 rounded-lg mt-7 border-1 border-neutral" v-if="avgScores && (cookie.length > 0 || dev)">
    <div class="hero-content flex flex-col text-center px-0 sm:px-1 md:px-4 w-full">
      <div class="w-full md:max-w-lg">
        <h1 class="text-2xl md:text-4xl font-bold">Past challenge scores</h1>
        <CookieChart :scores="avgScores" :cookie="cookie" />
      </div>
    </div>
  </div>

  <div class="hero bg-base-300 rounded-lg mt-7 border-1 border-neutral">
    <div class="hero-content flex flex-col text-center px-0 sm:px-1 md:px-4 w-full">
      <h1 class="text-2xl md:text-4xl font-bold">Game archive</h1>

      <div class="w-full flex flex-col gap-4 flex-wrap">
        <div>
          You can find <b>all past challenges</b> in the <NuxtLink to="/archive" class="text-primary"><b>Archive</b></NuxtLink>.
        </div>
        <div class="w-full flex justify-center">
          <div class="border-secondary border-1 w-fit py-3 px-10 rounded-md bg-black/10 shadow-lg">
            <h2 class="text-xl md:text-2xl font-medium">Yesterday's challenge</h2>
            <div v-if="gameDataPast">
              <h4 class="text-md mb-2">{{ gameDataPast.dayFriendly }}</h4>
              <div class="flex flex-wrap gap-2 justify-center">
                <GameIconRow :games="gameDataPast.data" :getState="_ => GameState.UPCOMING" :iconSize="6" />
              </div>
              <button class="btn btn-primary btn-md mt-2" @click="navigateArchive()">Play in archive</button>
            </div>
            <div v-else>
              <span class="loading loading-spinner-lg"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>