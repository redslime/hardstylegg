<script setup lang="ts">
import {GameState} from "~/types/models";
import type {NavigatorContainer} from "~/types/gameModels";
import {type RichArtist, RichTrack} from "~/types/content";
import NavigatorArtistView from "~/components/games/navigator/NavigatorArtistView.vue";
import {countAttempt} from "~/utils/game";
import {ref} from "vue";
import {useIntersectionObserver} from "@vueuse/core";
import NavigatorBar from "~/components/games/navigator/NavigatorBar.vue";

export type OptionalNavigatorStep = undefined | NavigatorStep
export interface NavigatorStep {
  artist: RichArtist
  track: RichTrack
}

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NavigatorDef
const emit = defineEmits<{ onFinish: [state: GameState] }>()
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<NavigatorContainer>, required: true }
})
const isMobile = inject<boolean>('isMobile')
const finished = computed(() => props.state == GameState.SUCCEEDED || props.state == GameState.FAILED)

const from = computed<RichArtist>(() => props.container.from)
const to = computed<RichArtist>(() => props.container.to)
const stepsLeft = computed(() => props.container.steps - currentStep.value)
const steps = ref<OptionalNavigatorStep[]>([])
const currentArtist = ref<RichArtist>(props.container.from)
const currentStep = ref<number>(0)
const reactiveKey = computed<string>(() => `tracks-${currentArtist.value.id}`)
const { data: currentArtistTracks, pending } = await useAsyncData<RichTrack[]>(reactiveKey,
    () => $fetch<RichTrack[]>(`/api/content/artist-tracks/${currentArtist.value.id}`).then(arr => arr.map(RichTrack.fromJson)),
    { lazy: true })

const bar = useTemplateRef('bar')
const isVisible = ref(true)
const { stop } = useIntersectionObserver(bar, ([entry], _) => {
  isVisible.value = entry?.isIntersecting || false
}, {
  threshold: 0.5
})

onUnmounted(() => stop())

function step(artist: RichArtist, track: RichTrack) {
  countAttempt()
  window.scrollTo({ top: 0 })

  if(artist.id === to.value.id) {
    emit("onFinish", GameState.SUCCEEDED)
    steps.value = steps.value!!.filter(e => e !== undefined)
    return
  }

  currentArtist.value = artist
  steps.value[currentStep.value] = {artist, track}
  currentStep.value = currentStep.value + 1

  if(stepsLeft.value === 0) {
    emit("onFinish", GameState.FAILED)
  }
}

watch(finished, () => steps.value = steps.value!!.filter(e => e !== undefined))

onMounted(() => {
  for(let i = 0; i < props.container.steps; i++){
    steps.value.push(undefined)
  }
})
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <Teleport to="#top-dock" :disabled="!isMobile || finished">
    <NavigatorBar :to="to" :from="from" :stepsLeft="stepsLeft" :currentStep="currentStep" :state="props.state" :steps="steps" ref="bar"/>
  </Teleport>

  <div class="flex gap-1 fixed left-1/2 -translate-x-1/2 top-4 shadow-lg z-30" v-if="!isVisible && !finished">
    <NavigatorBar :to="to" :from="from" :stepsLeft="stepsLeft" :currentStep="currentStep" :state="props.state" :steps="steps" :flipTooltip="true" />
  </div>

  <div class="border border-white/10 p-3 rounded-md mt-8 bg-base-100 w-full" v-if="!finished">
    <NavigatorArtistView :artist="currentArtist" :tracks="currentArtistTracks" :pending="pending" @selected="step" />
  </div>

  <div class="mt-4 text-lg font-semibold alert alert-soft alert-error py-0.5" v-if="stepsLeft <= 0">
    You ran out of steps!
  </div>
</template>

<style scoped>

</style>