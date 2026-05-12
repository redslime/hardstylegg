<script setup lang="ts">
import {getCurrentReport, getGameName, getPreviewTitle, getReportAt} from "~/utils/game";
import {type GameData, type GameReport, GameState} from "~/types/models";
import WordleDynamicIcon from "~/components/games/wordle/WordleDynamicIcon.vue";

const { $gameRegistry } = useNuxtApp();
const props = defineProps({
  games: { type: Array as PropType<GameData[]> },
  gameIds: { type: Array as PropType<{ typeId: number, gameId: number }[]> },
  getState: { type: Function as PropType<(index: number) => GameState> },
  outlineIndex: { type: Number, default: -1 },
  click: { type: Function as PropType<(index: number) => void> },
  iconSize: { type: Number, default: 6 },
  style: { type: String, default: "" },
  reports: { type: Array as PropType<GameReport[] | undefined> }
})
const getState = props.getState ?? ((index: number) => {
  if(props.games) {
    return props.games[index]!!.props.state
  }
})

function getReport(game: GameData): GameReport | undefined {
  const typeId = $gameRegistry.findGameByName(game.name)?.id
  const gameId = game.props.container.id
  const currentReport = getCurrentReport()

  if(currentReport) {
    return currentReport.data.find(r => r.typeId === typeId && r.gameId === gameId)
  } else if(props.reports) {
    return props.reports.find(r => r.typeId === typeId && r.gameId === gameId)
  }
}

function showWordleIcon(game: GameData, index: number): boolean {
  return game.name === 'Wordle'
      && (game.props.state === GameState.SUCCEEDED || game.props.state === GameState.FAILED || getReport(game) !== undefined)
      && !([...getWordleBoard(game, index).split(",").join("")].every(c => c === '-' || c === ','))
}

function getWordleBoard(game: GameData, gameIndex: number): string {
  return getReportAt(gameIndex)?.custom ?? getReport(game)?.custom ?? ""
}
</script>

<template>
  <template v-if="props.games" v-for="(game, index) in props.games" :key="game.name">
    <div class="flex flex-col items-center justify-start">
      <div class="p-3 rounded-md tooltip" :data-tip="getPreviewTitle(game)"
           @click="props.click?.(index)"
           v-if="!showWordleIcon(game, index)"
           :class="[props.style, {
            'outline-2 outline-primary': props.outlineIndex === index,
            'bg-base-100': getState(index) === GameState.UPCOMING,
            'bg-primary text-primary-content': getState(index) === GameState.PLAYING,
            'bg-success': getState(index) === GameState.SUCCEEDED,
            'bg-error': getState(index) === GameState.FAILED,
            'cursor-pointer': props.click
          }]">
        <component :is="$gameRegistry.findGameByName(game.name)!!.icon" :state="getState(index)" :size="props.iconSize"  />
      </div>

      <WordleDynamicIcon class="tooltip rounded-md" :class="{'cursor-pointer': props.click, 'outline-2 outline-primary': props.outlineIndex === index}"
                         :board="getWordleBoard(game, index)" :data-tip="getPreviewTitle(game)" @click="props.click?.(index)" v-else />

      <slot name="gameData" :data="game">
        <span class="text-sm font-semibold" v-if="getReport(game)">
          {{ $gameRegistry.findGameByName(game.name)!!.getPreviewDetails(getReport(game)!!, game.props.container) }}
        </span>
      </slot>
    </div>
  </template>

  <template v-for="id in props.gameIds" :key="`${id.typeId}-${id.gameId}`" v-else-if="props.gameIds">
    <div class="flex flex-col items-center justify-start">
      <div class="p-3 rounded-md tooltip bg-base-100"
           :class="[props.style]" :data-tip="getGameName(id.typeId)">
        <component :is="$gameRegistry.findGameById(id.typeId)!!.icon" :state="GameState.UPCOMING" :size="props.iconSize" />
      </div>

      <slot name="ids" :typeId="id.typeId" :gameId="id.gameId">

      </slot>
    </div>
  </template>
</template>

<style scoped>

</style>