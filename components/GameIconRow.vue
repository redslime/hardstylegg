<script setup lang="ts">
import {getGameName, getPreviewTitle} from "~/utils/game";
import {type GameData, GameState} from "~/types/models";

const { $gameRegistry } = useNuxtApp();
const props = defineProps({
  games: { type: Array as PropType<GameData[]> },
  gameIds: { type: Array as PropType<number[]> },
  getState: { type: Function as PropType<(index: number) => GameState> },
  outlineIndex: { type: Number, default: -1 },
  click: { type: Function as PropType<(index: number) => void> },
  iconSize: { type: Number, default: 6 },
  style: { type: String, default: "" }
})
const getState = props.getState ?? ((index: number) => {
  if(props.games) {
    return props.games[index]!!.props.state
  }
})

</script>

<template>
  <div v-if="props.games" v-for="(game, index) in props.games" :key="game.name" class="p-3 rounded-md tooltip" :data-tip="getPreviewTitle(game)"
       @click="props.click?.(index)"
       :class="[props.style, {
            'outline-2 outline-primary': props.outlineIndex === index,
            'bg-base-100': getState(index) === GameState.UPCOMING,
            'bg-primary text-primary-content': getState(index) === GameState.PLAYING,
            'bg-success': getState(index) === GameState.SUCCEEDED,
            'bg-error': getState(index) === GameState.FAILED,
            'cursor-pointer': props.click
          }]">
    <component :is="$gameRegistry.findGameByName(game.name)!!.icon" :state="getState(index)" />
  </div>
  <div v-else-if="props.gameIds" v-for="typeId in props.gameIds" :key="typeId" class="p-3 rounded-md tooltip bg-base-100"
       :class="[props.style]" :data-tip="getGameName(typeId)">
    <component :is="$gameRegistry.findGameById(typeId)!!.icon" :state="GameState.UPCOMING" :size="props.iconSize" />
  </div>
</template>

<style scoped>

</style>