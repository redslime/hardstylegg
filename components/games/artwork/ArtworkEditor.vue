<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {getName} from "~/utils/tracks";
import {getSpotifyArtwork} from "~/utils/utils";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import ArtworkUploader from "~/components/games/artwork/ArtworkUploader.vue";
import {ref} from "vue";
import Checkmark from "~/components/icons/Checkmark.vue";
import ArtworkPreview from "~/components/games/artwork/ArtworkPreview.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ArtworkDef
const { data, pending, error } = await useAsyncData<ArtworkContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<ArtworkContainer[] | undefined>()
const editing = ref<ArtworkContainer | undefined>()

const previewUrl = ref<string | null>(null)
const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const uploadDone = ref(false)

watchOnce(data, () => instances.value = data.value)

async function upload() {
  if (!editing.value || !editing.value.blankFile) return
  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', editing.value.blankFile)

    const data = await $fetch<{ success: boolean, fileName: string }>('/api/dashboard/edit/artworkFile', {
      method: 'POST',
      body: formData,
    })

    if(data && data.success) {
      editing.value.artwork_blank = data.fileName
      uploadDone.value = true
      editing.value.blankFile = undefined
      editing.value.uploadedName = undefined

      if(previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
    }
  } catch (err: any) {
    uploadError.value = err.message || 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

function reset() {
  previewUrl.value = null
  isUploading.value = false
  uploadError.value = null
  uploadDone.value = false
}

function clearUpload() {
  if(previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }

  editing.value!!.blankFile = undefined
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @saved="reset()"
        @cancelled="reset()"
    >
      <template #previewBody="{ instance, clicked }">
        <ArtworkPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.track">{{ getName(editing.track) }}</div>
          <TrackPicker v-if="!editing.artwork_blank" @selected="t => (editing!!.track = t)" :title="editing!!.track ? 'Replace' : 'Select'" />
        </div>
      </template>

      <template #editBody v-if="editing">
        <div class="w-full flex gap-2" v-if="editing.track">
          <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
            <div class="bg-black/20 rounded-box shadow-md p-2">
              <p class="text-center text-xl mb-2">Original artwork</p>
              <img :src="`${getSpotifyArtwork(editing.track.cover_art)}`" :alt="editing.track.title"
                   class="w-full h-auto rounded-xl shrink shadow-md"/>
            </div>
          </div>
          <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
            <div class="bg-black/20 rounded-box shadow-md p-2">
              <p class="text-center text-xl mb-2">Blank artwork</p>
              <img v-if="editing.artwork_blank" :src="`${getLocalArtwork(editing.artwork_blank)}`" alt="Blank artwork"
                   class="w-full h-auto rounded-xl shrink shadow-md"/>
              <img v-else-if="previewUrl" :src="previewUrl" alt="Blank artwork"
                   class="w-full h-auto rounded-xl shrink shadow-md"/>

              <div v-else class="w-full aspect-square rounded-xl shrink shadow-md bg-black/20 flex items-center justify-center border-dashed border-2 border-base-content/20">
                <ArtworkUploader v-model:selectedFile="editing.blankFile" v-model:previewUrl="previewUrl" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5" v-if="editing.blankFile">
          <button class="btn btn-primary btn-soft" disabled v-if="isUploading"><span class="loading loading-spinner loading-md"></span> Uploading</button>
          <div role="alert" class="alert alert-error alert-outline" v-else-if="uploadError">
            <span>Failed to upload artwork: {{ uploadError }}. Please try again later.</span>
          </div>
          <button class="btn btn-success btn-soft" disabled v-else-if="uploadDone"><Checkmark class="text-success" /> Uploaded</button>
          <div class="flex gap-2" v-else>
            <button class="btn btn-primary btn-soft" v-if="editing.blankFile.type === 'image/png'" @click="upload">Upload artwork</button>
            <button class="btn btn-warning btn-soft" @click="clearUpload">Reset artwork</button>
          </div>
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>