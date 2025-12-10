<script setup lang="ts">
import {addImageDataStep, translateDataStep} from "~/utils/zoomer"
import {type Coordinates, Cropper, type ImageTransforms, Preview} from 'vue-advanced-cropper'
import type {ZoomerImageData, ZoomerInternalImage} from "~/types/zoomerModels";
import CameraIcon from "~/components/icons/CameraIcon.vue";
import ZoomerProgressbar from "~/components/games/zoomer/ZoomerProgressbar.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";

interface StepData {
  coordinates: Coordinates;
  image: {
    width: number;
    height: number;
    transforms: ImageTransforms;
    src: string | null;
  };
}

const progressbar = ref()
const cropperRef = ref()
const step = ref(1)

const currentPreviewData = ref<StepData>()
const result = defineModel<ZoomerImageData>()
const author = computed(() => result.value?.author)
const imgBase64 = computed(() => result.value?.img64)

const onStepClick = (i: number) => {
  const { coordinates } = translateDataStep(i, result.value!!)
  cropperRef.value.setCoordinates(coordinates)
}

const onChange = ({ coordinates, image }: { coordinates: any, image: any }) => {
  currentPreviewData.value = {
    coordinates,
    image
  }
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const WEBP_QUALITY = 0.85 // compression quality (0–1)

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > MAX_SIZE) {
    alert("Image must be under 5MB.")
    input.value = ""
    return
  }

  if (!file.type.startsWith("image/")) {
    alert("Not a valid image file.")
    input.value = ""
    return
  }

  const header = await file.slice(0, 16).arrayBuffer()
  const bytes = new Uint8Array(header)

  const isJPG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E
  const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46
  const isWEBP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 // RIFF

  if (!isJPG && !isPNG && !isGIF && !isWEBP) {
    alert("Unsupported image format.")
    input.value = ""
    return
  }

  // load base64 via filereader
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject("Could not read file.")
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })

  // load into img tag
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject("Invalid image data.")
    image.src = base64
  })

  // into canvas for webp
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    alert("Browser does not support canvas.")
    return
  }

  ctx.drawImage(img, 0, 0)
  const webpDataUrl = canvas.toDataURL("image/webp", WEBP_QUALITY)
  result.value!.img64 = webpDataUrl

  console.log("Converted to WebP. Size:", Math.round(webpDataUrl.length / 1024), "KB")
}


const save = () => {
  if(step.value > 5) return

  if(currentPreviewData.value) {
    const {coordinates, image} = currentPreviewData.value
    result.value = addImageDataStep(result.value!!, coordinates, image as unknown as ZoomerInternalImage)
  }

  // update ui
  progressbar.value?.stepSuccess()
  step.value++
}
</script>

<template>
  <div class="join w-full mb-3" v-if="!imgBase64">
    <label class="input join-item w-full">
      <CameraIcon />
      <input
          type="text"
          v-model="result!!.author"
          placeholder="Photo credits"
          required
      />
    </label>
  </div>

  <input
      v-if="!imgBase64 && author"
      type="file"
      accept="image/*"
      @change="onFileChange"
      class="file-input"
  />

  <div v-if="imgBase64" class="flex flex-wrap items-center">
    <preview
        :width="800"
        :height="600"
        :image="currentPreviewData?.image"
        :coordinates="currentPreviewData?.coordinates"
    />
    <cropper
        v-if="step <= 5"
        ref="cropperRef"
        :src="imgBase64"
        @change="onChange"
        :debounce="false"
        :stencil-props="{
          aspectRatio: 1.33
        }"
    />

    <div class="flex flex-col bg-base-100 items-center w-full p-8" v-if="step <= 5">
      <ZoomerProgressbar ref="progressbar" :action="onStepClick" :step="step" class="mb-5" />
      <button class="btn btn-lg btn-success" @click="save">Save {{ step }}</button>

      <p class="mt-2 opacity-80 flex gap-1" v-if="step > 1">
        <InfoIcon class="text-info" />
        You can click on the checkmarks to reset the selection to that step.
      </p>
    </div>
  </div>
</template>

<style scoped>
.vue-advanced-cropper {
  width: 800px;
  height: 600px;
}
:deep(.step-icon svg) {
  cursor: pointer;
}
</style>