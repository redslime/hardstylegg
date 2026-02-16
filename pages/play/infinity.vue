<script setup lang="ts">
import InfinityConfigurator from "~/components/infinity/InfinityConfigurator.vue";
import {
  type GameContainer,
  GameEnvironment,
  type InfinityRequestContainer,
  type InfinityResponseContainer,
  type PackedDayData
} from "~/types/models";
import InfinityIcon from "~/components/icons/InfinityIcon.vue";
import {transform} from "~/utils/game";
import {INFINITY_END_YEAR, INFINITY_START_YEAR, setYears, startInfinity} from "~/utils/infinity";

type StateType = "setup" | "loading" | "playing" | "finished";
const state = ref<StateType>("setup");
const playingContainer = ref<GameContainer | null>(null);
const error = ref<string | null>(null);
const query = useRoute().query
const typeEncoding = query.ic as string
const shareCode = query.icc as string
const years = computed<{ start: number, end: number } | undefined>(() => {
  if(query.y) {
    const parts = (query.y as string).split(":")
    return { start: Math.max(INFINITY_START_YEAR, Number(parts[0])), end: Math.min(INFINITY_END_YEAR, Number(parts[1])) }
  }
})

useRouter().replace({ query: {} })

async function load(container: InfinityRequestContainer | { code: string }) {
  error.value = null
  state.value = "loading"

  try {
    const response = await $fetch<InfinityResponseContainer>('/api/infinity', {
      method: "POST",
      body: container
    })

    const packedData: PackedDayData = {
      dayId: -1,
      dayFriendly: "Infinity",
      typeIds: response.typeIds.map(Number),
      editors: "",
      data: response.gameData
    }

    playingContainer.value = transform(packedData);
    startInfinity(response)

    if('startYear' in container) {
      const start = container.startYear
      const end = container.endYear

      if(!(start === INFINITY_START_YEAR && end === INFINITY_END_YEAR)) {
        setYears(start, end)
      }
    }

    state.value = "playing"
  } catch(e: any) {
    state.value = "setup"

    if(e.response?.status === 404) {
      error.value = e.response?.statusText
      return
    } else {
      error.value = "Something went wrong, please try again!"
      return
    }
  }
}
</script>

<template>
  <div class="hero bg-base-300 rounded-lg" v-if="state !== 'playing'">
    <div class="hero-content flex flex-col">
      <div class="items-center justify-center text-center">
        <h1 class="text-3xl md:text-4xl font-bold">
          <InfinityIcon class="size-12 inline-block align-middle -mt-1 text-primary" />
          Infinity mode
        </h1>
      </div>

      <div role="alert" class="alert alert-error" v-if="error">
        <span><b>Error!</b> {{ error }}</span>
      </div>

      <InfinityConfigurator :typeEncoding="typeEncoding" :shareCode="shareCode" :years="years" @done="load" v-if="state === 'setup'" />

      <template v-else-if="state === 'loading'">
        <span class="loading loading-infinity size-28 -mb-10 -mt-5"></span>
        <p>Loading questions...</p>
      </template>
    </div>
  </div>

  <template v-if="state === 'playing' && playingContainer">
    <GameFlow :gameEnv="GameEnvironment.INFINITY" :gameData="playingContainer" />
  </template>
</template>

<style scoped>

</style>
