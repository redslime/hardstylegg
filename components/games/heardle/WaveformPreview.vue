<script setup lang="ts">
import {ref} from "vue";
import {useWaveSurfer, useWaveSurferRegions, useWaveSurferTimeline} from "@meersagor/wavesurfer-vue";
import type {RegionParams} from "wavesurfer.js/plugins/regions";
import type {HeardleContainer} from "~/types/gameModels";

const { container } = defineProps({
  container: { type: Object as PropType<HeardleContainer>, required: true }
})
const config = useRuntimeConfig()
const containerRef = ref<HTMLElement | null>(null)
const skeleton = ref<boolean>(true)

const options = ref({
  height: 60,
  width: 500,
  waveColor: '#3ABDF7',
  cursorWidth: 0,
  interact: false,
  barGap: 1,
  barWidth: 2,
  barRadius: 1,
  url: config.public.appUrl + '/heardle/' + container.src + ".mp3",
})

// Using core functionality - returns waveSurfer instance and all state
const { waveSurfer, isReady } = useWaveSurfer({
  containerRef,
  options: options.value
})

const { regionsPlugin } = useWaveSurferRegions({ waveSurfer })
const { timelinePlugin } = useWaveSurferTimeline({ waveSurfer })

watch(isReady, (ready) => {
  if (ready && regionsPlugin.value) {
    const durs: number[] = deepCopy(container.durations)
    durs.pop()
    durs.unshift(0)

    durs.forEach((duration) => {
      regionsPlugin.value!!.addRegion({
        start: duration,
        color: '#F471B5',
        drag: false,
        resize: false,
      } as RegionParams)
    })

    skeleton.value = false
  }
})
</script>

<template>
  <div>
    <div class="relative w-[500px] h-[80px]">
      <div v-if="skeleton" class="skeleton absolute inset-0 rounded-lg transition-opacity duration-300"
           :class="skeleton ? 'opacity-100' : 'opacity-0'"
      ></div>

      <div ref="containerRef" class="transition-opacity duration-500"
           :class="skeleton ? 'opacity-0' : 'opacity-100'"
      ></div>
    </div>
  </div>
</template>

<style scoped>

</style>