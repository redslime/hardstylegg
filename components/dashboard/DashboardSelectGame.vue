<script setup lang="ts">
import type {
  ArtworkContainer,
  CompleteAlbumContainer,
  CompleteLyricsContainer,
  HeardleContainer,
  NameXContainer,
  OrderContainer,
  QuizContainer,
  TimelineContainer,
  TimetableContainer
} from "~/types/gameModels";
import {
  getArtworkData,
  getCompleteAlbumData,
  getCompleteLyricsData,
  getHeardleData,
  getNameXData,
  getOrderData,
  getQuizData,
  getTimelineData,
  getTimetableData
} from "~/utils/dashboard";

type EditorData =
    | ArtworkContainer[]
    | CompleteAlbumContainer[]
    | CompleteLyricsContainer[]
    | HeardleContainer[]
    | NameXContainer[]
    | OrderContainer[]
    | QuizContainer[]
    | TimelineContainer[]
    | TimetableContainer[]

const emit = defineEmits(['select'])
const { typeId } = defineProps({
  typeId: { type: Number, required: true }
})
const { data, pending, error, clear } = await useAsyncData<EditorData>(() => {
  switch(typeId) {
    case 1: return getArtworkData()
    case 2: return getCompleteAlbumData()
    case 3: return getCompleteLyricsData()
    case 4: return getHeardleData()
    case 5: return getNameXData()
    case 6: return getOrderData()
    case 7: return getQuizData()
    case 8: return getTimelineData()
    case 9: return getTimetableData()
    default: return getArtworkData()
  }
}, { lazy: true })

function select(instance: any) {
  emit('select', { data: instance, typeId: typeId})
}

onUnmounted(() => {
  clear()
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div class="flex flex-wrap gap-4 justify-center" v-if="data">
    <div class="relative group w-fit" v-for="instance in data" :key="instance.id">
      <DashboardGamePreview :typeId="typeId!!" :instance="instance" />

      <div class="absolute z-10 inset-0 rounded-lg border-1 border-primary flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" @click="select(instance)">

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>