<script setup lang="ts">
import {ref} from "vue";
import {useWaveSurfer} from "@meersagor/wavesurfer-vue";
import type {HeardleContainer} from "~/types/gameModels";

const { container } = defineProps({
  container: { type: Object as PropType<HeardleContainer>, required: true }
})
const config = useRuntimeConfig()
const containerRef = ref<HTMLElement | null>(null)
const skeleton = ref<boolean>(true)
const finished = ref<boolean>(false)

const options = ref({
  height: 40,
  waveColor: '#6c6c6c',
  progressColor: '#3ABDF7',
  cursorWidth: 0,
  interact: false,
  barGap: 1,
  barWidth: 3,
  barRadius: 5,
  url: config.public.appUrl + '/heardle/' + container.src + ".mp3",
})

// Using core functionality - returns waveSurfer instance and all state
const { waveSurfer, isReady } = useWaveSurfer({
  containerRef,
  options: options.value
})

watch(waveSurfer,
    (ws, _prev, onCleanup) => {
      if (!ws) return

      const unsubscribe = ws.on('error', (err: Error) => {
        console.error('WaveSurfer load/decode error:', err)
        skeleton.value = false
        finished.value = true
      })

      onCleanup(() => unsubscribe())
    },
    { immediate: true }
)

watch(isReady, (ready) => {
  if (ready) {
    skeleton.value = false
    waveSurfer.value?.setVolume(0.2)
    waveSurfer.value?.play()

    waveSurfer.value?.on('finish', () => {
      waveSurfer.value?.seekTo(0)
      finished.value = true
    })
  }
})

onDeactivated(() => {
  waveSurfer.value?.stop()
  waveSurfer.value?.seekTo(0)
  finished.value = true
})
</script>

<template>
  <div>
    <div class="relative">
      <div v-if="skeleton" class="skeleton absolute inset-0 rounded-lg transition-opacity duration-300"
           :class="skeleton ? 'opacity-100' : 'opacity-0'">
      </div>

      <div
        ref="containerRef"
        class="max-w-[450px] w-full transition-all duration-500"
        :class="{
          'opacity-0': skeleton,
          'opacity-100': !finished && !skeleton,
          'opacity-80 md:blur-sm': finished && !skeleton
        }"
      />

      <div class="absolute flex w-full justify-center -mt-11 transition-opacity duration-300"
          :class="{'opacity-0': !finished, 'opacity-100': finished}">
        <slot v-if="finished">

        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>