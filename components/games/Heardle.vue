<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Howl} from 'howler'
import PlayIcon from "~/components/icons/PlayIcon.vue";
import SpeakerWave from "~/components/icons/game/SpeakerWave.vue";
import {GameState, type ShallowTrack, type Track} from "~/types/models";
import {getSpotifyArtwork} from "~/utils/utils";
import {getName} from "~/utils/tracks";
import SpotifyButton from "~/components/SpotifyButton.vue";
import type {HeardleContainer} from "~/types/gameModels";
import ForwardIcon from "~/components/icons/ForwardIcon.vue";
import {countAttempt} from "~/utils/game";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<HeardleContainer>, required: true }
})

const state = computed(() => props.state)
const gameFinished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const track = computed<Track>(() => props.container.track)
const src = computed(() => props.container.src)
const durations = computed(() => props.container.durations)
const hasPlayed = ref<boolean>(false)
const currentIndex = inject<number>('currentIndex')
const isMobile = inject<boolean>('isMobile')

interface Guess {
  input: string | undefined
  correct: boolean | undefined
}

const guessStage = ref(0)
const isPlaying = ref(false)
const guesses = ref<Guess[]>([])
const finished = computed(() => guessStage.value >= durations.value.length || guesses.value.find(g => g.correct))
const playbackProgress = ref(0) // 0 to 100 percentage

// Calculate total duration (max duration)
const totalDuration = computed(() => Math.max(...durations.value))

// Calculate the incremental duration for each segment
const segmentDurations = computed(() => {
  return durations.value.map((d, i) => {
    if (i === 0) return d
    return d - durations.value[i - 1]
  })
})

// Calculate width percentage for each segment based on incremental durations
const segmentWidths = computed(() => {
  return segmentDurations.value.map(d => (d / totalDuration.value) * 100)
})

let howl: Howl | null = null
let timeout: number | null = null
let progressInterval: number | null = null

onMounted(() => {
  durations.value.forEach(_ => {
    guesses.value.push({input: undefined, correct: undefined})
  });

  howl = new Howl({
    src: [`/heardle/${src.value}.mp3`],
    preload: true,
    volume: 0.2
  });
})

onDeactivated(() => {
  howl?.unload()
  if (timeout) clearTimeout(timeout)
  if (progressInterval) clearInterval(progressInterval)
})

function playSnippet() {
  hasPlayed.value = true

  if (!howl) return
  const duration = durations.value[guessStage.value]
  const start = 0
  howl.stop()
  howl.seek(start)
  howl.play()
  isPlaying.value = true
  playbackProgress.value = 0

  // Update progress bar smoothly
  const startTime = Date.now()
  if (progressInterval) clearInterval(progressInterval)

  progressInterval = window.setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000 // in seconds
    // Progress within the entire bar (0 to duration of current stage)
    const progressInSeconds = Math.min(elapsed, duration)
    // Convert to percentage relative to total duration
    playbackProgress.value = (progressInSeconds / totalDuration.value) * 100
  }, 50) // update every 50ms for smooth animation

  // stop after snippet duration
  timeout = window.setTimeout(() => {
    howl?.stop()
    isPlaying.value = false
    playbackProgress.value = 0
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }, duration * 1000)
}

function nextStage() {
  countAttempt()
  guesses.value[guessStage.value] = {input: "", correct: false}

  if (guessStage.value >= durations.value.length - 1) {
    emit('onFinish', GameState.FAILED)
  }

  playbackProgress.value = 0 // Reset progress when moving to next stage
  guessStage.value++
}

function validate(selected: ShallowTrack, flashError: () => void, flashSuccess: () => void, clear: () => void) {
  countAttempt()

  if(selected.sid === track.value.sid) {
    guesses.value[guessStage.value] = {input: getName(selected), correct: true}
    emit('onFinish', GameState.SUCCEEDED)
  } else {
    guesses.value[guessStage.value] = {input: getName(selected), correct: false}
    flashError()
    clear()

    if (guessStage.value >= durations.value.length - 1) {
      emit('onFinish', GameState.FAILED)
    }

    playbackProgress.value = 0 // Reset progress when moving to next stage
  }

  hasPlayed.value = false
  guessStage.value++
}
</script>

<template>
  <GameTitle>
    <template #icon>
      <SpeakerWave />
    </template>
    <template #title>
      What is the name of this track?
    </template>
  </GameTitle>

  <div class="w-4/5" v-if="!finished && !gameFinished">
    <TrackInput
        @on-track-selected="validate"
        v-slot="{ inputBindings, inputEvents }"
    >
      <div class="join flex justify-center items-center">
        <button class="btn btn-primary join-item" :disabled="isPlaying" @click="playSnippet">
          <PlayIcon/>
          {{ isMobile ? "Play" : "Play snippet" }}
        </button>
        <input
            v-bind="inputBindings"
            v-on="inputEvents"
            class="join-item"
            type="text"
            placeholder="Guess track to progress"
        />
        <button class="btn btn-warning btn-soft join-item tooltip" v-if="hasPlayed && guessStage < durations.length-1" @click="nextStage"
          data-tip="No idea what to guess? Go to next stage now">
          {{ isMobile ? "Next" : "Next stage" }}
          <ForwardIcon />
        </button>
      </div>
    </TrackInput>

    <div class="w-full h-6 divide-x divide-neutral rounded-md flex overflow-hidden mt-3 relative">
      <div
          v-for="(d, i) in segmentDurations"
          :key="i"
          class="relative border-r border-neutral last:border-r-0"
          :class="{
            'bg-base-100': playbackProgress >= 0,
            'bg-secondary': playbackProgress === 0 && i <= guessStage
          }"
          :style="{
            width: `${segmentWidths[i]}%`
          }">
        <span 
          v-if="i === guessStage && playbackProgress === 0"
          class="absolute inset-0 flex items-center justify-center text-xs text-secondary-content font-semibold z-5"
        >
          {{ durations[i] }}s
        </span>
      </div>

      <div 
        class="absolute inset-0 bg-secondary transition-all duration-75 ease-linear origin-left"
        :style="{ width: `${playbackProgress}%` }"
      ></div>
    </div>
  </div>

  <div class="relative w-full h-60" v-if="finished || gameFinished">
    <img
        :src="`${getSpotifyArtwork(track.cover_art)}`"
        alt="Track artwork"
        class="w-full h-full object-cover rounded-md"
    />
    <div class="absolute inset-0 flex items-center justify-center backdrop-blur-xs">
      <p class="text-2xl font-bold drop-shadow-lg text-white bg-black/30 p-2">
        {{ track.artists }} - {{ track.title }}
      </p>
      <div class="absolute bottom-4 right-4" v-if="currentIndex === props.position">
        <SpotifyButton :track="track" />
      </div>
    </div>
  </div>

  <div class="grid w-full px-10 gap-3 mt-8">
    <div v-for="(guess, index) in guesses" :key="index"
         class="rounded-sm border p-2 min-h-[42px]"
         :class="{
            'border-white/30': guess.correct === undefined,
            'border-white/60': guessStage === index,
            'border-success': guess.correct === true,
            'border-error': guess.correct === false,
            'hidden': (guess.correct === undefined && gameFinished) ||
            (finished || gameFinished) && guess.correct === undefined && index > guessStage
          }">
      {{ guess.input }}
    </div>
  </div>
</template>
