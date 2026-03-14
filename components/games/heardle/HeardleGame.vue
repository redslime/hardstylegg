<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import {computed, onMounted, ref} from 'vue'
import PlayIcon from "~/components/icons/PlayIcon.vue";
import {GameState} from "~/types/models";
import TrackListenButton from "~/components/TrackListenButton.vue";
import ForwardIcon from "~/components/icons/ForwardIcon.vue";
import {countAttempt} from "~/utils/game";
import WaveformPlayer from "~/components/games/heardle/WaveformPlayer.vue";
import {useWaveSurfer, type UseWaveSurfer, useWaveSurferRegions} from "@meersagor/wavesurfer-vue";
import type {RegionParams} from "wavesurfer.js/plugins/regions";
import {FlatTrack} from "~/types/content";

const config = useRuntimeConfig()
const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.HeardleDef
const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<HeardleContainer>, required: true }
})

const state = computed(() => props.state)
const gameFinished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const track = computed<FlatTrack>(() => FlatTrack.fromJson(props.container.track))
const isYouTube = computed<boolean>(() => track.value.isYouTube())
const src = computed(() => props.container.src)
const durations = computed(() => props.container.durations)
const hasPlayed = ref<boolean>(false)
const skeleton = ref<boolean>(true)
const silence = ref<HTMLAudioElement | null>(null)
const currentIndex = inject<number>('currentIndex')
const isMobile = inject<boolean>('isMobile')

interface Guess {
  input: string | undefined
  correct: boolean | undefined
}

const guessStage = ref(0)
const currentStageDuration = computed(() => durations.value[guessStage.value] ?? 0)
const trackInput = ref<HTMLInputElement | undefined>()
const guesses = ref<Guess[]>([])
const finished = computed(() => guessStage.value >= durations.value.length || guesses.value.find(g => g.correct))

let wavesurfer: UseWaveSurfer | null = null
const containerRef = ref<HTMLElement | null>(null)

if(import.meta.client) {
  const options = ref({
    height: 40,
    waveColor: '#6c6c6c',
    progressColor: '#818cf8',
    cursorWidth: 0,
    interact: false,
    barGap: 1,
    barWidth: 3,
    barRadius: 5,
    url: config.public.appUrl + '/heardle/' + src.value + ".mp3",
  })

  wavesurfer = useWaveSurfer({
    containerRef,
    options: options.value
  })
  const { waveSurfer } = wavesurfer
  const { regionsPlugin } = useWaveSurferRegions({ waveSurfer })

  watch(wavesurfer.isReady, (ready) => {
    if(ready) {
      wavesurfer?.waveSurfer.value?.setVolume(0.2)
      skeleton.value = false

      if(regionsPlugin.value) {
        const durs: number[] = deepCopy(durations.value)
        durs.pop()

        durs.forEach((duration) => {
          regionsPlugin.value!!.addRegion({
            start: duration,
            color: '#cbcbcb',
            drag: false,
            resize: false,
          } as RegionParams)
        })
      }

      wavesurfer?.waveSurfer.value?.on('audioprocess', (currentTime: number) => {
        if(currentTime >= currentStageDuration.value) {
          wavesurfer?.waveSurfer.value?.pause()
        }
      })
    }
  })
}

onMounted(() => {
  durations.value.forEach(_ => {
    guesses.value.push({input: undefined, correct: undefined})
  });
})

onDeactivated(() => {
  // triggered inside GameFlow since it's wrapped around <KeepAlive>
  unmounted()
})

onUnmounted(() => {
  unmounted()
})

watch(gameFinished, () => {
  if(gameFinished.value) {
    unlockIOSAudio()
  }
})

function unmounted() {
  wavesurfer?.waveSurfer.value?.stop()
  wavesurfer?.waveSurfer.value?.destroy()
}

async function playSnippet() {
  hasPlayed.value = true
  unlockIOSAudio()
  await nextTick()

  wavesurfer?.waveSurfer.value?.stop()
  wavesurfer?.waveSurfer.value?.seekTo(0)
  wavesurfer?.waveSurfer.value?.play()
}

function nextStage() {
  countAttempt()
  guesses.value[guessStage.value] = {input: "", correct: false}

  if (guessStage.value >= durations.value.length - 1) {
    emit('onFinish', GameState.FAILED)
  }

  guessStage.value++
  wavesurfer?.waveSurfer.value?.seekTo(currentStageDuration.value / 15)
}

function validate(selected: FlatTrack, flashError: () => void, _flashSuccess: () => void, clear: () => void) {
  countAttempt()

  if(selected.sid === track.value.sid) {
    guesses.value[guessStage.value] = {input: selected.getDisplayName(), correct: true}
    emit('onFinish', GameState.SUCCEEDED)
  } else {
    guesses.value[guessStage.value] = {input: selected.getDisplayName(), correct: false}
    flashError()
    clear()

    if (guessStage.value >= durations.value.length - 1) {
      emit('onFinish', GameState.FAILED)
    }
  }

  hasPlayed.value = false
  guessStage.value++
  wavesurfer?.waveSurfer.value?.seekTo(currentStageDuration.value / 15)
}

function unlockIOSAudio() {
  silence.value?.play().catch(() => {})
}
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <audio ref="silence" id="silent-audio" preload="auto">
    <source src="/silence.mp3" type="audio/mp3">
  </audio>

  <div class="w-full px-3 md:px-0 md:w-4/5" v-if="!finished && !gameFinished">
    <BaseTrackInput
        @onSelected="validate"
        v-slot="{ inputBindings, inputEvents }"
    >
      <div class="join flex justify-center items-center">
        <button class="btn btn-primary join-item" :disabled="wavesurfer?.isPlaying.value || !wavesurfer?.isReady.value" @click="playSnippet">
          <PlayIcon/>
          {{ isMobile ? "Play" : "Play snippet" }}
        </button>
        <input
            v-bind="inputBindings"
            v-on="inputEvents"
            class="join-item"
            type="text"
            placeholder="Guess track to progress"
            ref="trackInput"
        />
        <button class="btn btn-warning btn-soft join-item tooltip" v-if="hasPlayed && guessStage < durations.length-1" @click="nextStage"
          data-tip="No idea what to guess? Go to next stage now">
          {{ isMobile ? "Next" : "Next stage" }}
          <ForwardIcon />
        </button>
      </div>
    </BaseTrackInput>

    <div class="relative mt-2 w-full h-10">
      <div v-if="skeleton" class="skeleton absolute inset-0 rounded-lg transition-opacity duration-300"
           :class="skeleton ? 'opacity-100' : 'opacity-0'"
      ></div>
      <div class="w-full mt-2" ref="containerRef"></div>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row justify-center bg-base-200 rounded-md shadow-md relative mt-5" v-if="finished || gameFinished">
    <a class="flex justify-center" :href="track.getPlayUrl()" target="_blank" v-if="!isYouTube">
      <img
          :src="track.getImageUrl()"
          alt="Track artwork"
          class="w-auto max-h-80 sm:w-40"
      />
    </a>

    <div class="flex flex-col p-4 justify-center bg-base-200 rounded-md sm:min-w-[380px]">
      <p class="text-xl font-semibold text-balance">{{ track.title }}</p>
      <p class="opacity-60">{{ track.getArtistsString() }}</p>

      <WaveformPlayer class="mt-3" :container="container">
        <template v-if="currentIndex === props.position">
          <TrackListenButton :track="track" />
        </template>
      </WaveformPlayer>
    </div>
  </div>

  <div class="grid w-full px-3 md:px-10 gap-3 mt-8">
    <div v-for="(guess, index) in guesses" :key="index"
         class="rounded-sm border p-2 min-h-[42px]"
         :class="{
            'border-white/30': guess.correct === undefined,
            'border-white/60': guessStage === index,
            'border-success': guess.correct === true,
            'border-error': guess.correct === false,
            'hidden': (guess.correct === undefined && gameFinished) ||
            (finished || gameFinished) && guess.correct === undefined && index > guessStage
          }"
          @click="trackInput?.focus()">
      {{ guess.input }}
    </div>
  </div>
</template>
