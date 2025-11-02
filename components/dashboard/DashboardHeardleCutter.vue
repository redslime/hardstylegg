<script setup lang="ts">
import Mp3Uploader from "~/components/Mp3Uploader.vue";
import type {HeardleContainer} from "~/types/gameModels";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import {FFmpeg} from '@ffmpeg/ffmpeg'
import {fetchFile} from '@ffmpeg/util'

const editing = defineModel<HeardleContainer>('editing', {required: true});
const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const segment = ref<{start: number, end: number}>({ start: 0, end: 15 });
const cutting = ref<boolean>(false);

async function run() {
  await cut()
}

async function cut() {
  if(!file.value) return
  cutting.value = true

  const ffmpeg = new FFmpeg()
  ffmpeg.on('log', (message) => {
    console.log(message.message)
  })
  console.log("loading")
  await ffmpeg.load()
  console.log("loaded")

  // Write uploaded file into virtual FS
  await ffmpeg.writeFile('input.mp3', await fetchFile(file.value))

  const duration = segment.value.end - segment.value.start

  // Run ffmpeg trim command
  await ffmpeg.exec([
      '-ss', String(segment.value.start),
      '-t', String(duration),
      '-i', 'input.mp3',
      '-map_metadata', '-1',
      '-acodec', 'copy',
      'output.mp3']
  )

  // Read output and create a blob URL
  const data = await ffmpeg.readFile('output.mp3')
  const blob = new Blob([data], { type: 'audio/mpeg' })
  const cutFile = new File([data], "cut.mp3", { type: 'audio/mpeg' })
  editing.value!!.previewUrl = URL.createObjectURL(blob)
  editing.value!!.tempFile = cutFile
  editing.value!!.durations = [1]
  cutting.value = false
}
</script>

<template>
  <div v-if="!file"
      class="w-full aspect-square rounded-xl shrink shadow-md bg-black/20 flex items-center justify-center border-dashed border-2 border-base-content/20">
    <Mp3Uploader v-model:selectedFile="file" v-model:previewUrl="previewUrl" />
  </div>
  <div class="w-full" v-else-if="previewUrl">
    <div class="text-xl mb-3">Select 15 second segment:</div>

    <WaveformCutter :previewUrl="previewUrl" v-model:segment="segment" />

    <p class="mt-5 opacity-80 flex gap-1">
      <InfoIcon class="text-info" />
      Drag the pink region to select the 15 second segment. Zoom with mouse wheel.
    </p>
    <p class="mt-2 opacity-80 flex gap-1">
      <InfoIcon class="text-info" />
      You will select the smaller guess segments in the next step.
    </p>

    <div class="mt-5 flex gap-2">
      <button class="btn btn-success btn-soft" v-if="!cutting" @click="run()">Save</button>
      <button class="btn btn-success btn-soft" v-if="cutting" disabled><span class="loading loading-spinner loading-md"></span> Cutting file...</button>
    </div>
  </div>
</template>

<style scoped>

</style>