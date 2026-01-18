<script lang="ts">
import type {ZoomerContainer} from "~/types/gameModels";

export default {
  getPreloadUrls: (container: ZoomerContainer): string[] => {
    return ['/zoomer/' + container.data.imgName + ".webp"]
  }
}
</script>

<script setup lang="ts">
import {GameState} from "~/types/models";
import {Preview} from "vue-advanced-cropper";
import CameraIcon from "~/components/icons/CameraIcon.vue";
import {translateDataStep} from "~/utils/zoomer";
import ZoomerProgressbar from "~/components/games/zoomer/ZoomerProgressbar.vue";
import ZoomerGoalSelector from "~/components/games/zoomer/ZoomerGoalSelector.vue";
import type {ZoomerType} from "~/types/zoomerModels";
import {countAttempt} from "~/utils/game";
import ZoomerTypeBadge from "~/components/games/zoomer/ZoomerTypeBadge.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ZoomerDef

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<ZoomerContainer>, required: true }
})
const goal = computed(() => props.container.goal)
const author = computed(() => props.container.data.author)
const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const details = inject<Ref<boolean>>("details", ref(false))
const isMobile = inject<boolean>('isMobile')
const currentIndex = inject<number>('currentIndex')
const summary = inject<boolean>("summary", false)

const container = ref<HTMLDivElement | null>(null)
const progressbar = ref()
const step = ref<number>(1)
const previewSize = ref({ width: 400, height: 300 })
const img = ref({
  coordinates: null,
  image: null
})

const updatePreviewSize = () => {
  const maxWidth = details.value ? Math.min(container.value!!.clientWidth, window.innerWidth - 10) : window.innerWidth - 10
  const width = Math.min(800, maxWidth)
  const height = (width * 600) / 800
  previewSize.value = { width, height }
}

function next(success: boolean) {
  step.value++
  img.value = translateDataStep(step.value, props.container.data)
  countAttempt()

  if(success) {
    progressbar.value?.stepSuccess()
    img.value = translateDataStep(5, props.container.data)
    emit("onFinish", GameState.SUCCEEDED)
  } else {
    progressbar.value?.stepFail()

    if(step.value > 5) {
      emit("onFinish", GameState.FAILED)
    }
  }
}

function submit(val: ZoomerType) {
  next(gameDef.isEqual(goal.value, val))
}

img.value = translateDataStep(1, props.container.data)

watch(state, () => {
  if(state.value === GameState.FAILED) {
    // skip was pressed
    img.value = translateDataStep(5, props.container.data)
  }
})

onMounted(() => {
  updatePreviewSize()
  window.addEventListener('resize', updatePreviewSize)
})

onActivated(async () => {
  await nextTick()
  updatePreviewSize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePreviewSize)
})
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <div v-show="img.image" ref="container" class="relative max-w-[800px] max-h-[600px]">
    <preview
        v-if="img.image"
        :width="previewSize.width"
        :height="previewSize.height"
        :image="img.image"
        :coordinates="img.coordinates"
    />

    <div class="absolute bottom-10 w-full z-500" v-if="finished">
      <Teleport to="#top-dock" :disabled="!isMobile || props.position !== currentIndex || summary || details">
        <div class="flex justify-center">
          <ZoomerTypeBadge :type="props.container.goal" :style="'badge-success badge-lg md:badge-xl'" />
        </div>
      </Teleport>
    </div>

    <div class="absolute inset-x-0 top-0 w-full h-full">
      <div class="absolute inset-x-0 bottom-0" v-if="finished">
        <p class="text-left text-gray-300 bg-black/70 p-1 text-sm md:text-base">
          <CameraIcon class="inline-block" /> {{ author }}
        </p>
      </div>
    </div>
  </div>

  <ZoomerProgressbar ref="progressbar" :step="step" :finished="finished" class="my-5" />
  <ZoomerGoalSelector v-if="!finished" :target="goal" :game="true" :step="step" :finished="finished" @select="g => submit(g)" />
</template>

<style>
.vue-preview__image {
  transition: transform .2s;
}
</style>