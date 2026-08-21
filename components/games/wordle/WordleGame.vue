<script setup lang="ts">
import {GameState} from "~/types/models";
import type {WordleContainer} from "~/types/gameModels";
import {computed, ref} from "vue";
import {FlatArtist} from "~/types/content";
import {useAsyncData} from "#app";
import {getArtists} from "~/utils/contentCache";
import WordleKeyboard from "~/components/games/wordle/WordleKeyboard.vue";
import {LetterState} from "~/utils/game/impl/ClientWordleGame";
import {countAttempt, reportResult} from "~/utils/game";
import WordleString from "~/components/games/wordle/WordleString.vue";

// Wordle core game code see https://github.com/yyx990803/vue-wordle, adjusted a lot
const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const isMobile = inject<boolean>('isMobile')
const emit = defineEmits<{ onFinish: [state: GameState] }>()
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<WordleContainer>, required: true }
})

const fetchProgress = ref<number>(0)
const { data: artists, pending } = await useAsyncData<FlatArtist[]>('artists-flat', () => getArtists((p) => {
  fetchProgress.value = p
}), { lazy: true })
const state = computed(() => props.state)
const gameFinished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const artist = computed<FlatArtist>(() => FlatArtist.fromJson(props.container.artist))

// Get word of the day
const answer = artist.value.name.toLowerCase()

// Board state. Each tile is represented as { letter, state }
const board = ref<{letter: string, state: LetterState}[][]>(
    Array.from({ length: 6 }, () =>
        Array.from({ length: artist.value.name.length }, () => ({
          letter: '',
          state: LetterState.INITIAL
        }))
    )
)

// Current active row.
let currentRowIndex = ref<number>(0)
const currentRow = computed<{letter: string, state: LetterState}[]>(() => board.value[currentRowIndex.value]!!)

// Feedback state: message and shake
let message = ref('')
let grid = ref('')
let shakeRowIndex = ref(-1)
let success = ref(false)

// Keep track of revealed letters for the virtual keyboard
const letterStates = ref<Record<string, LetterState>>({})

// Handle keyboard input.
let allowInput = true

const onKeyup = (e: KeyboardEvent) => onKey(e.key)

window.addEventListener('keyup', onKeyup)

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup)
})

function onKey(key: string) {
  if (!allowInput || gameFinished.value) return
  if (/^[a-zA-Z,-]$/.test(key)) {
    fillTile(key.toLowerCase())
  } else if (key === 'Backspace') {
    clearTile()
  } else if (key === 'Enter') {
    completeRow()
  }
}

function fillTile(letter: string) {
  for (const tile of currentRow.value) {
    if (!tile.letter) {
      tile.letter = letter
      break
    }
  }
}

function clearTile() {
  for (const tile of [...currentRow.value].reverse()) {
    if (tile.letter) {
      tile.letter = ''
      break
    }
  }
}

function completeRow() {
  if (currentRow.value.every((tile) => tile.letter)) {
    const guess = currentRow.value.map((tile) => tile.letter).join('')
    if (!artists.value!!.map(a => a.name.toLowerCase()).includes(guess) && guess !== answer) {
      shake()
      showMessage(`Not in artist name list`)
      return
    }

    const answerLetters: (string | null)[] = answer.split('')
    // first pass: mark correct ones
    currentRow.value.forEach((tile, i) => {
      if (answerLetters[i] === tile.letter) {
        tile.state = letterStates.value[tile.letter] = LetterState.CORRECT
        answerLetters[i] = null
      }
    })
    // second pass: mark the present
    currentRow.value.forEach((tile) => {
      if (!tile.state && answerLetters.includes(tile.letter)) {
        tile.state = LetterState.PRESENT
        answerLetters[answerLetters.indexOf(tile.letter)] = null
        if (!letterStates.value[tile.letter]) {
          letterStates.value[tile.letter] = LetterState.PRESENT
        }
      }
    })
    // 3rd pass: mark absent
    currentRow.value.forEach((tile) => {
      if (!tile.state) {
        tile.state = LetterState.ABSENT
        if (!letterStates.value[tile.letter]) {
          letterStates.value[tile.letter] = LetterState.ABSENT
        }
      }
    })

    allowInput = false
    countAttempt()

    if (currentRow.value.every((tile) => tile.state === LetterState.CORRECT)) {
      // yay!
      setTimeout(() => {
        grid.value = genResultGrid()
        success.value = true
        emit("onFinish", GameState.SUCCEEDED)
        reportBoard(true)
      }, 1600)
    } else if (currentRowIndex.value < board.value.length - 1) {
      // go the next row
      currentRowIndex.value++
      setTimeout(() => {
        allowInput = true
      }, 1600)
    } else {
      // game over :(
      emit("onFinish", GameState.FAILED)
      reportBoard()
    }
  } else {
    shake()
    showMessage('Not enough letters')
  }
}

function showMessage(msg: string, time = 1000) {
  message.value = msg
  if (time > 0) {
    setTimeout(() => {
      message.value = ''
    }, time)
  }
}

function shake() {
  shakeRowIndex.value = currentRowIndex.value
  setTimeout(() => {
    shakeRowIndex.value = -1
  }, 1000)
}

const icons = {
  [LetterState.CORRECT]: '🟩',
  [LetterState.PRESENT]: '🟨',
  [LetterState.ABSENT]: '⬜',
  [LetterState.INITIAL]: null
}

function genResultGrid() {
  return board.value
      .slice(0, currentRowIndex.value + 1)
      .map((row) => {
        return row.map((tile) => icons[tile.state]).join('')
      })
      .join('\n')
}

function reportBoard(win: boolean = false) {
  reportResult(gr => {
    gr.custom = gameDef.serializeBoard(board.value)
    gr.success = win
  })
}

watch(gameFinished, () => reportBoard(state.value === GameState.SUCCEEDED))
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <Transition>
    <div class="message" v-if="message">
      {{ message }}
      <pre v-if="grid">{{ grid }}</pre>
    </div>
  </Transition>
  <div id="board">
    <div
        v-for="(row, index) in board"
        :class="[
          'flex gap-1',
          shakeRowIndex === index && 'shake',
          success && currentRowIndex === index && 'jump'
        ]"
    >
      <div
          v-for="(tile, index) in row"
          class="w-11 h-11 sm:w-14 sm:h-14"
          :class="['tile', tile.letter && 'filled', tile.state && 'revealed']"
      >
        <div class="front rounded-md text-xl sm:text-3xl" :style="{ transitionDelay: `${index * 300}ms` }">
          {{ tile.letter }}
        </div>
        <div
            class="rounded-md text-xl sm:text-3xl"
            :class="['back', tile.state]"
            :style="{
          transitionDelay: `${index * 300}ms`,
          animationDelay: `${index * 100}ms`
        }"
        >
          {{ tile.letter }}
        </div>
      </div>
    </div>
  </div>

  <template v-if="state === GameState.FAILED">
    <h3 class="text-lg font-bold text-center">Solution:</h3>
    <WordleString :guess="props.container.artist.name" :solution="props.container.artist.name" />
  </template>


  <Teleport to="#bottom-dock" :disabled="!isMobile">
    <WordleKeyboard @key="onKey" :letterStates="letterStates" :ready="!pending" v-if="!gameFinished" />
  </Teleport>

  <div class="h-70" v-if="isMobile" />
</template>

<style scoped>
#board {
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  display: grid;
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
  justify-content: center;
}
.message {
  position: absolute;
  left: 50%;
  top: 235px;
  color: var(--color-warning-content);
  background-color: var(--color-warning);
  padding: 10px 20px;
  z-index: 2;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease-out;
  font-weight: 600;
}
.message.v-leave-to {
  opacity: 0;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
}
.tile {
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}
.tile.filled {
  animation: zoom 0.2s;
}
.tile .front,
.tile .back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.tile .front {
  border: 2px solid #999;
}
.tile.filled .front {
  border-color: #d3d6da;
}
.tile .back {
  transform: rotateX(180deg);
}
.tile.revealed .front {
  transform: rotateX(180deg);
}
.tile.revealed .back {
  transform: rotateX(0deg);
}

@keyframes zoom {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(1px);
  }
  10% {
    transform: translate(-2px);
  }
  20% {
    transform: translate(2px);
  }
  30% {
    transform: translate(-2px);
  }
  40% {
    transform: translate(2px);
  }
  50% {
    transform: translate(-2px);
  }
  60% {
    transform: translate(2px);
  }
  70% {
    transform: translate(-2px);
  }
  80% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(1px);
  }
}

.jump .tile .back {
  animation: jump 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  20% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-25px);
  }
  90% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-height: 680px) {
  .tile {
    font-size: 3vh;
  }
}

h1 {
  margin: 4px 0;
  font-size: 36px;
}

header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 30px;
  position: relative;
}

#source-link {
  position: absolute;
  right: 1em;
  top: 0.5em;
}

.correct,
.present,
.absent {
  color: #fff !important;
}

.correct {
  background-color: #6aaa64 !important;
}

.present {
  background-color: #c9b458 !important;
}

.absent {
  background-color: #787c7e !important;
}
</style>