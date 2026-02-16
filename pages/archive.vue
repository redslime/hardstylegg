<script setup lang="ts">
import {type GameContainer, GameEnvironment, GameState} from "~/types/models";
import {archiveGames, getArchiveGame, getDayFriendlyName, getYesterdayGame} from "~/utils/archive";
import ArchiveGamePreview from "~/components/ArchiveGamePreview.vue";
import {watchOnce} from "@vueuse/shared";
import {deepCopyReactive} from "~/utils/utils";

const { data: yesterday, clear } = useAsyncData<GameContainer>(() => getYesterdayGame(), { lazy: true })
const ydayFriendly = ref<string>("")
const oldestId = computed(() => archiveGames.map(g => g.dayId).sort((a, b) => a - b)[0])
const loading = ref<boolean>(false)
const playing = ref<GameContainer | undefined>()

function play(dayId: number) {
  window.history.pushState({}, "", `/play/archive`)
  playing.value = deepCopyReactive(archiveGames.find(g => g.dayId === dayId)!!)
}

function endGame() {
  window.history.pushState({}, "", `/archive`)
  playing.value = undefined
}

async function expand() {
  loading.value = true
  const ids = []

  for(let i = 1; i <= 5; i++) {
    const id = oldestId.value!! - i

    if(id > 0) {
      ids.push(id)
    }
  }

  await Promise.all(ids.map(id => getArchiveGame(id)))
  loading.value = false
}

window.addEventListener('popstate', () => {
  playing.value = undefined
})

watchOnce(yesterday, async (val) => ydayFriendly.value = await getDayFriendlyName(val?.dayId ?? 0, "LLLL d"))
onUnmounted(() => clear())
</script>

<template>
  <div class="hero bg-base-300 rounded-lg" v-if="!playing">
    <div class="hero-content flex flex-col text-center">
      <div class="max-w-lg items-center justify-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-5">Game archive</h1>

        <div class="border border-secondary w-fit py-3 px-3 sm:px-10 rounded-md bg-black/10 shadow-lg mb-10">
          <h2 class="text-2xl font-medium">Yesterday's challenge</h2>
          <div v-if="yesterday">
            <h4 class="text-md">{{ ydayFriendly }}</h4>
            <h4 class="text-md text-secondary font-medium" v-if="yesterday.theme">{{ yesterday.theme }}</h4>

            <div class="flex flex-wrap gap-2 justify-center mt-2">
              <GameIconRow :games="yesterday.data" :getState="_ => GameState.UPCOMING" :iconSize="6" />
            </div>
            <button class="btn btn-primary btn-md mt-2" @click="play(yesterday.dayId)">Play</button>
          </div>
          <div v-else>
            <span class="loading loading-spinner-lg"></span>
          </div>
        </div>

        <template v-if="archiveGames.length > 0">
          <h3 class="text-2xl font-bold">Older games</h3>
          <p class="text-base-content/70">Click to play</p>
          <div class="flex flex-col gap-4 mt-5">
            <div v-for="game in archiveGames" :key="game.dayId">
              <ArchiveGamePreview :container="game" @click="play(game.dayId)" />
            </div>
          </div>

          <button v-if="oldestId && oldestId > 1 && !loading" class="mt-5 btn btn-soft btn-secondary" @click="expand()">Load more...</button>
          <button v-if="oldestId && oldestId > 1 && loading" class="mt-5 btn btn-soft btn-secondary" disabled><span class="loading loading-spinner loading-md"></span> Loading more</button>
        </template>
      </div>
    </div>
  </div>

  <template v-else-if="playing">
    <h1 class="text-2xl font-bold mb-5">Challenge from {{ playing.dayFriendly }}</h1>
    <GameFlow :gameEnv="GameEnvironment.ARCHIVE" :gameData="playing" @finish="endGame()" />
  </template>
</template>

<style scoped>

</style>