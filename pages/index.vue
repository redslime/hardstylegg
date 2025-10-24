<script setup lang="ts">
import {gameComps, getGameContainer, getPreviewTitle} from "~/utils/game";
import {type GameContainer, GameState} from "~/types/models";

const gameData: GameContainer = await getGameContainer()
const valid = gameData.dayId !== -1 && gameData.data.length > 0

function play() {
  navigateTo('/play')
}
</script>

<template>
  <div class="hero bg-base-300">
    <div class="hero-content flex flex-col text-center" v-if="valid">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Daily challenge</h1>
        <h4 class="text-xl mt-2">{{ gameData.dayFriendly }}</h4>
      </div>
      <div class="flex justify-center flex-wrap gap-2 mb-3">
        <div v-for="(game, index) in gameData.data" :key="index" class="p-3 rounded-md bg-base-100 tooltip" :data-tip="getPreviewTitle(game)">
          <component :is="gameComps[game.name as keyof typeof gameComps].icon" :state="GameState.UPCOMING" />
        </div>
      </div>
      <button class="btn btn-primary btn-xl" @click="play">Play</button>
    </div>

    <div class="hero-content flex flex-col text-center" v-else>
      <div class="max-w-md">
        <h1 class="text-4xl font-bold">No active challenge</h1>
        <h4 class="text-xl mt-2">Nothing to play right now, check back later!</h4>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>