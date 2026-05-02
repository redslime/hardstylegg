<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {getLocalArtwork} from "~/utils/utils";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import ArtworkUploader from "~/components/games/artwork/ArtworkUploader.vue";
import {ref} from "vue";
import Checkmark from "~/components/icons/Checkmark.vue";
import ArtworkPreview from "~/components/games/artwork/ArtworkPreview.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ArtworkDef
const { data, pending, error } = await useAsyncData<ArtworkContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: existingIds } = await useAsyncData<string[]>(() => gameDef.getExistingTracks(), { lazy: true })
const instances = ref<ArtworkContainer[] | undefined>()
const editing = ref<ArtworkContainer | undefined>()

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const uploadDone = ref(false)

const imgSrc = computed<string | undefined>(() => {
  return editing.value!!.img64 ?? getLocalArtwork(editing.value!!.imgName)
})

watchOnce(data, () => instances.value = data.value)

function reset() {
  isUploading.value = false
  uploadError.value = null
  uploadDone.value = false
}

function clearUpload() {
  editing.value!!.img64 = undefined
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
          <div class="text-2xl font-bold" v-if="editing.track">{{ editing.track.getDisplayName() }}</div>
          <TrackPicker @selected="t => (editing!!.track = t.toFlatTrack())" :title="editing!!.track ? 'Replace' : 'Select'" :existing="existingIds" />
        </div>
      </template>

      <template #editBody v-if="editing">
        <div class="w-full flex gap-2" v-if="editing.track">
          <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
            <div class="bg-black/20 rounded-box shadow-md p-2">
              <p class="text-center text-xl mb-2">Original artwork</p>
              <img :src="editing.track.getImageUrl()" :alt="editing.track.title"
                   class="w-full h-auto rounded-xl shrink shadow-md"/>
            </div>
          </div>
          <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
            <div class="bg-black/20 rounded-box shadow-md p-2">
              <p class="text-center text-xl mb-2">Blank artwork</p>
              <img v-if="imgSrc" :src="imgSrc" alt="Blank artwork"
                   class="w-full h-auto rounded-xl shrink shadow-md"/>

              <div v-else class="w-full aspect-square rounded-xl shrink shadow-md bg-black/20 flex items-center justify-center border-dashed border-2 border-base-content/20">
                <ArtworkUploader v-model:img64="editing!!.img64" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5" v-if="editing.img64">
          <button class="btn btn-primary btn-soft" disabled v-if="isUploading"><span class="loading loading-spinner loading-md"></span> Uploading</button>
          <div role="alert" class="alert alert-error alert-outline" v-else-if="uploadError">
            <span>Failed to upload artwork: {{ uploadError }}. Please try again later.</span>
          </div>
          <button class="btn btn-success btn-soft" disabled v-else-if="uploadDone"><Checkmark class="text-success" /> Uploaded</button>
          <div class="flex gap-2" v-else>
            <button class="btn btn-warning btn-soft" @click="clearUpload">Reset artwork</button>
          </div>
        </div>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>