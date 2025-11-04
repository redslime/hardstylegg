<script setup lang="ts">
import {gameComps, getGameContainer, getPreviewTitle, startGame} from "~/utils/game";
import {type GameData, GameState} from "~/types/models";

const { data: gameData, pending, error } = await useAsyncData(() => getGameContainer(), { lazy: true })
const exists = computed(() => gameData.value !== undefined && gameData.value.dayId !== -1)
const played = computed(() => {
  const games = (gameData.value?.data.length ?? 0) > 0
  const progress = gameData.value?.data
      .filter(gd => gd.props.state === GameState.UPCOMING || gd.props.state === GameState.PLAYING).length === 0
  return games && progress
})

// todo also feed played and state from cookie data, not just cached components

function getState(game: GameData): GameState {
  if(!played.value) {
    return GameState.UPCOMING
  } else {
    return game.props.state
  }
}

async function play() {
  navigateTo('/play')
}
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
          'bg-base-100': getState(game) === GameState.UPCOMING,
          'bg-primary text-primary-content': getState(game) === GameState.PLAYING,
          'bg-success': getState(game) === GameState.SUCCEEDED,
          'bg-error': getState(game) === GameState.FAILED,
        }">
            <component :is="gameComps[game.name as keyof typeof gameComps].icon" :state="getState(game)" />
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