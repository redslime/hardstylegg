<script setup lang="ts">
import {ref} from "vue";
import {useWaveSurfer, useWaveSurferRegions, useWaveSurferZoom} from "@meersagor/wavesurfer-vue";
import type {RegionParams} from "wavesurfer.js/plugins/regions";
import PlayIcon from "~/components/icons/PlayIcon.vue";
import PauseIcon from "~/components/icons/PauseIcon.vue";

const segment = defineModel<{start: number, end: number}>('segment', { required: true })
const { previewUrl } = defineProps({
  previewUrl: { type: String, required: true }
})

const containerRef = ref<HTMLElement | null>(null)
const playing = ref<boolean>(false)
const ready = ref<boolean>(false)
let regionStart = 0

const options = ref({
  height: 60,
  width: 500,
  waveColor: '#3ABDF7',
  progressColor: '#bde8fc',
  cursorWidth: 1,
  interact: true,
  barGap: 1,
  barWidth: 2,
  barRadius: 1,
  url: previewUrl
})

// Using core functionality - returns waveSurfer instance and all state
const { waveSurfer, isReady, totalDuration, isPlaying, currentTime } = useWaveSurfer({
  containerRef,
  options: options.value
})

const { zoomPlugin } = useWaveSurferZoom({ waveSurfer, zoomOptions: { scale: 0.005 } })
const { regionsPlugin } = useWaveSurferRegions({ waveSurfer })

watch(isReady, (state) => {
  if(state) {
    ready.value = true
    waveSurfer.value?.setVolume(0.2)

    waveSurfer.value?.on('play', () => {
      playing.value = true
      waveSurfer.value?.setTime(regionStart)
    })

    waveSurfer.value?.on('pause', () => {
      playing.value = false
    })

    waveSurfer.value?.on('finish', () => {
      playing.value = false
      waveSurfer.value?.setTime(regionStart)
    })

    waveSurfer.value?.on('seeking', (currentTime: number) => {
      regionsPlugin.value?.getRegions().forEach(region => {
        region.setOptions({
          start: currentTime,
          end: currentTime + 15
        })
      })
      segment.value = { start: currentTime, end: currentTime + 15 }
      regionStart = currentTime
    })

    waveSurfer.value?.on('audioprocess', (currentTime: number) => {
      if(currentTime >= regionStart + 15) {
        playing.value = false
        waveSurfer.value?.stop()
        waveSurfer.value?.setTime(regionStart)
      }
    })
  }

  if(ready && regionsPlugin.value) {
    regionsPlugin.value!!.addRegion({
      start: 0,
      end: 15,
      color: 'rgba(244,113,181,0.55)',
      drag: true,
      resize: false
    } as RegionParams)

    regionsPlugin.value!!.on('region-updated', region => {
      waveSurfer.value?.setTime(region.start)
      regionStart = region.start
      segment.value = { start: region.start, end: region.end }
    })
  }
})
</script>

<template>
  <div class="flex gap-3 items-center">
    <button class="btn btn-primary btn-soft rounded-full" :disabled="!ready" @click="waveSurfer?.play()" v-if="!playing">
      <PlayIcon v-if="ready" />
      <span v-else class="loading loading-spinner loading-md"></span>
    </button>
    <button class="btn btn-primary btn-soft rounded-full" @click="waveSurfer?.pause()" v-else>
      <PauseIcon />
    </button>

    <div class="w-full overflow-hidden" ref="containerRef"></div>
  </div>
</template>

<style scoped>

</style>