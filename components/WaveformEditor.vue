<script setup lang="ts">
import {ref} from "vue";
import {useWaveSurfer, useWaveSurferRegions} from "@meersagor/wavesurfer-vue";
import type {RegionParams} from "wavesurfer.js/plugins/regions";
import PlayIcon from "~/components/icons/PlayIcon.vue";
import PauseIcon from "~/components/icons/PauseIcon.vue";

const duration = defineModel<number>('duration', { required: true })
const { previewUrl } = defineProps({
  previewUrl: { type: String, required: true }
})

const containerRef = ref<HTMLElement | null>(null)
const playing = ref<boolean>(false)
let timeout: number | null = null

const options = ref({
  height: 60,
  width: 400,
  waveColor: '#3ABDF7',
  progressColor: '#c13af7',
  cursorWidth: 0,
  interact: false,
  barGap: 1,
  barWidth: 2,
  barRadius: 1,
  url: previewUrl,
})

// Using core functionality - returns waveSurfer instance and all state
const { waveSurfer, isReady, totalDuration, isPlaying, currentTime } = useWaveSurfer({
  containerRef,
  options: options.value
})

const { regionsPlugin } = useWaveSurferRegions({ waveSurfer })

watch(isReady, (ready) => {
  if(ready) {
    waveSurfer.value?.setVolume(0.2)

    waveSurfer.value?.on('play', () => {
      playing.value = true
      timeout = window.setTimeout(() => {
        waveSurfer.value?.stop()
        waveSurfer.value?.setTime(0)
      }, duration.value * 1000)
    })

    waveSurfer.value?.on('pause', () => {
      playing.value = false
      clearTimeout(timeout)
    })

    waveSurfer.value?.on('finish', () => {
      playing.value = false
      waveSurfer.value?.setTime(0)
    })

    waveSurfer.value?.on('audioprocess', (currentTime: number) => {
      if(currentTime >= duration.value) {
        playing.value = false
        waveSurfer.value?.stop()
        waveSurfer.value?.setTime(0)
      }
    })
  }

  if(ready && regionsPlugin.value) {
    regionsPlugin.value!!.addRegion({
      start: 0,
      end: duration.value,
      color: 'rgba(244,113,181,0.27)',
      drag: false,
      resizeStart: false,
      resizeEnd: true
    } as RegionParams)

    regionsPlugin.value!!.addRegion({
      start: duration.value,
      content: "" + duration.value + "s",
      color: 'rgb(244,113,181)',
      drag: false,
      resize: false,
    } as RegionParams)

    regionsPlugin.value.on('region-updated', event => {
      duration.value = Math.round(event.end)
    })
  }
})
</script>

<template>
  <div class="flex gap-3 items-center">
    <button class="btn btn-primary btn-soft rounded-full" @click="waveSurfer?.play()" v-if="!playing">
      <PlayIcon />
    </button>
    <button class="btn btn-primary btn-soft rounded-full" @click="waveSurfer?.pause()" v-else>
      <PauseIcon />
    </button>

    <div ref="containerRef"></div>
  </div>
</template>

<style scoped>

</style>