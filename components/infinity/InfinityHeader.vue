<script setup lang="ts">
import {type GameData, GameState} from "~/types/models";
import InfinityIcon from "~/components/icons/InfinityIcon.vue";

const { gameData, currentIndex } = defineProps({
  gameData: { type: Array as PropType<GameData[]>, required: true },
  currentIndex: { type: Number, required: true },
})

const total = computed<number>(() => gameData.length)
const percentage = computed<number>(() => {
  let sum = 0
  let successful = 0

  for(let i = 0; i < currentIndex; i++) {
    sum++

    if(gameData[i]!!.props.state === GameState.SUCCEEDED) {
      successful++
    }
  }

  if(sum === 0) {
    return 0
  }

  return Math.round((successful / sum) * 100)
})
</script>

<template>
  <div class="flex gap-1 justify-center md:text-lg">
    <p class="font-bold">{{ currentIndex+1 }}/{{ total }}</p>
    <p><InfinityIcon class="text-primary size-6 md:size-7" /></p>
    <p class="font-bold">{{ percentage }}%</p>
  </div>

  <div class="flex flex-wrap gap-0.5 justify-center mb-8 -mt-2 md:px-24">
    <div v-for="(game, index) in gameData" :key="index" class="h-2">
        <span class="status status-sm md:status-md"
              :class="{
                 'status-success': game.props.state === GameState.SUCCEEDED,
                 'status-error': game.props.state === GameState.FAILED
                }"></span>
    </div>
  </div>
</template>

<style scoped>

</style>