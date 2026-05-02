<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import {ref} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateHeardleDurations} from "#shared/gameValidators";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import DashboardHeardleCutter from "~/components/dashboard/DashboardHeardleCutter.vue";
import HeardlePreview from "~/components/games/heardle/HeardlePreview.vue";
import WaveformEditor from "~/components/games/heardle/WaveformEditor.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.HeardleDef
const { data, pending, error } = await useAsyncData<HeardleContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: existingIds } = await useAsyncData<string[]>(() => gameDef.getExistingTracks(), { lazy: true })
const instances = ref<HeardleContainer[] | undefined>()
const editing = ref<HeardleContainer | undefined>()
const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const uploadDone = ref(false)

const sourceUrl = computed(() => {
  if(editing.value?.src) {
    return "/heardle/" + editing.value.src + ".mp3"
  } else if(editing.value?.previewUrl) {
    return editing.value.previewUrl
  } else {
    return undefined
  }
})

const durationsValid = computed<boolean>(() => {
  if(!editing.value?.durations) return false
  const errors: string[] = []
  validateHeardleDurations(editing.value!!.durations, errors)
  return errors.length === 0
})

watchOnce(data, () => instances.value = data.value)

function del(index: number) {
  editing.value!!.durations.splice(index, 1)
}

function canAdd(): boolean {
  if(!editing.value?.durations) return true

  const last = editing.value?.durations[editing.value?.durations.length - 1]
  const amount = editing.value?.durations?.length
  return (last ?? 0) <= 14 && (amount ?? 0) < 6
}

function add() {
  if(!editing.value?.durations) {
    editing.value!!.durations = []
  }

  const last = editing.value?.durations[editing.value?.durations.length - 1]
  editing.value!!.durations.push(last ? last + 1 : 1)
}

async function uploadMp3() {
  if(!editing.value || !editing.value.tempFile) return
  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', editing.value.tempFile)

    const data = await $fetch<{ success: boolean, fileName: string }>('/api/dashboard/edit/heardleFile', {
      method: 'POST',
      body: formData,
    })

    if(data && data.success) {
      editing.value.src = data.fileName
      uploadDone.value = true
      editing.value.tempFile = undefined

      if(editing.value.previewUrl) {
        URL.revokeObjectURL(editing.value.previewUrl)
        editing.value.previewUrl = undefined
      }
    }
  } catch (err: any) {
    uploadError.value = err.message || 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

function reset() {
  isUploading.value = false
  uploadError.value = null
  uploadDone.value = false
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
        <HeardlePreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.track">{{ editing.track.getDisplayName() }}</div>
          <TrackPicker v-if="!editing.track" @selected="t => (editing!!.track = t.toFlatTrack())" :title="editing!!.track ? 'Replace' : 'Select'" :existing="existingIds" />
        </div>
      </template>

      <template #editBody v-if="editing">
        <template v-if="sourceUrl">
          <div class="text-xl mb-3">Track segments:</div>
          <div class="flex flex-col gap-5">
            <template v-for="(dur, index) in editing.durations" :key="dur">
              <div class="flex gap-2 items-center">
                <WaveformEditor v-model:duration="editing.durations[index]!!" :previewUrl="sourceUrl" />
                <button class="btn btn-error btn-soft" @click="del(index)">
                  <TrashIcon />
                </button>
              </div>
            </template>
          </div>

          <div class="mt-5" v-if="uploadError">
            <div role="alert" class="alert alert-error alert-outline">
              <span>Error! {{ uploadError }}</span>
            </div>
          </div>

          <div class="flex gap-3 mt-5">
            <button class="btn btn-primary btn-soft" @click="add()" v-if="canAdd()">Add segment</button>
            <button class="btn btn-success btn-soft" v-if="durationsValid && !editing.src && !isUploading" @click="uploadMp3()">Upload segments</button>
            <button class="btn btn-success btn-soft" disabled v-if="durationsValid && !editing.src && isUploading"><span class="loading loading-spinner loading-md"></span> Uploading</button>
          </div>

          <p class="mt-5 opacity-80 flex gap-1">
            <InfoIcon class="text-info" />
            The amount of segments corresponds the amount of guesses. Aim for around 5.
          </p>

          <ContextField v-model:input="editing.context" />
        </template>
        <template v-else-if="editing.track">
          <DashboardHeardleCutter :editing="editing" />
        </template>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>