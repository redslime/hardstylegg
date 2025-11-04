<script setup lang="ts">
import {gameComps, getGameContainer, getPreviewTitle, hasPlayedToday} from "~/utils/game";
import {type CookieDayMemory, GameState} from "~/types/models";
import {getTracks} from "~/utils/tracks";
import {refreshCookie} from "#app";

const { data: gameData, pending, error } = await useAsyncData(() => getGameContainer(), { lazy: true })
const cookie = useCookie<CookieDayMemory[]>("memory", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "strict",
  default: () => []
})
const exists = computed(() => gameData.value !== undefined && gameData.value.dayId !== -1)
const played = computed(() => hasPlayedToday(cookie.value, gameData.value?.dayId))
const dataToday = computed(() => cookie.value?.find(d => d.day === gameData.value?.dayId)?.data)

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

onMounted(() => {
  void getTracks() // preload tracks
  refreshCookie("memory")
})
</script>

<template>
  <div class="hero bg-base-300">
    <div class="hero-content flex flex-col text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Daily challenge</h1>
        <h4 class="text-xl mt-2" v-if="gameData">{{ gameData.dayFriendly }}</h4>
      </div>

      <template v-if="pending">
        <span class="loading loading-spinner loading-xl"></span>
      </template>
      <template v-else-if="gameData && exists">
        <div class="flex justify-center flex-wrap gap-2 mb-3">
          <div v-for="(game, index) in gameData.data" :key="index" class="p-3 rounded-md tooltip" :data-tip="getPreviewTitle(game)"
               :class="{
            'bg-base-100': getState(index) === GameState.UPCOMING,
            'bg-primary text-primary-content': getState(index) === GameState.PLAYING,
            'bg-success': getState(index) === GameState.SUCCEEDED,
            'bg-error': getState(index) === GameState.FAILED,
          }">
            <component :is="gameComps[game.name as keyof typeof gameComps].icon" :state="getState(index)" />
          </div>
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
</template>

<style scoped>

</style>