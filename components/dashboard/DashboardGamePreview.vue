<script setup lang="ts" generic="T extends EditorContainer">
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
import ArtworkPreview from "~/components/dashboard/preview/ArtworkPreview.vue";
import CompleteAlbumPreview from "~/components/dashboard/preview/CompleteAlbumPreview.vue";
import CompleteLyricsPreview from "~/components/dashboard/preview/CompleteLyricsPreview.vue";
import HeardlePreview from "~/components/dashboard/preview/HeardlePreview.vue";
import NameXPreview from "~/components/dashboard/preview/NameXPreview.vue";
import OrderPreview from "~/components/dashboard/preview/OrderPreview.vue";
import QuizPreview from "~/components/dashboard/preview/QuizPreview.vue";
import TimelinePreview from "~/components/dashboard/preview/TimelinePreview.vue";
import TimetablePreview from "~/components/dashboard/preview/TimetablePreview.vue";

const { typeId, instance } = defineProps({
  typeId: { type: Number, required: true },
  instance: { type: Object as PropType<T>, required: true }
})
</script>

<template>
  <ArtworkPreview v-if="typeId === 1" :instance="instance as ArtworkContainer" :pointer="false" />
  <CompleteAlbumPreview v-else-if="typeId === 2" :instance="instance as CompleteAlbumContainer" :pointer="false" />
  <CompleteLyricsPreview v-else-if="typeId === 3" :instance="instance as CompleteLyricsContainer" :pointer="false" />
  <HeardlePreview v-else-if="typeId === 4" :instance="instance as HeardleContainer" :pointer="false" />
  <NameXPreview v-else-if="typeId === 5" :instance="instance as NameXContainer" :pointer="false" />
  <OrderPreview v-else-if="typeId === 6" :instance="instance as OrderContainer" :pointer="false" />
  <QuizPreview v-else-if="typeId === 7" :instance="instance as QuizContainer" :pointer="false" />
  <TimelinePreview v-else-if="typeId === 8" :instance="instance as TimelineContainer" :pointer="false" />
  <TimetablePreview v-else-if="typeId === 9" :instance="instance as TimetableContainer" :pointer="false" />
</template>

<style scoped>

</style>