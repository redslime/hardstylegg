<script setup lang="ts">
import {addImageDataStep, translateDataStep} from "~/utils/zoomer"
import {type Coordinates, Cropper, type ImageTransforms, Preview} from 'vue-advanced-cropper'
import type {ZoomerImageData, ZoomerInternalImage} from "~/types/zoomerModels";
import CameraIcon from "~/components/icons/CameraIcon.vue";
import ZoomerProgressbar from "~/components/games/zoomer/ZoomerProgressbar.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import {processImageToWebP} from "~/utils/image";

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

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    result.value!!.img64 = await processImageToWebP(file)
  } catch (err: any) {
    alert(err.message)
  }
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