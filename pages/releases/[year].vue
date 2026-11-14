<script setup lang="ts">
import ChevronLeftIcon from "~/components/icons/ChevronLeftIcon.vue";
import ChevronRightArrow from "~/components/icons/ChevronRightArrow.vue";
import BaseTrackView from "~/components/dashboard/content/BaseTrackView.vue";
import {RichAlbum, RichTrack} from "~/types/content.ts";
import {getCacheParam} from "~/utils/cacheKeys.ts";

definePageMeta({
  layout: 'plain'
})

const route = useRoute()
const year = computed<number>(() => Number(route.params.year as string))
const v = await getCacheParam("tracks")
const { data: content } = await useFetch<{ tracks: RichTrack[], albums: RichAlbum[] }>(`/api/content/year/${year.value}` + v, { lazy: true })
const albumData = computed(() => content.value?.albums?.map(a => RichAlbum.fromJson(a)) ?? undefined)
const trackData = computed(() => content.value?.tracks?.map(t => RichTrack.fromJson(t)) ?? undefined)

const albums = computed<RichAlbum[] | undefined>(() => {
  return albumData.value?.filter(a => a.year === year.value)?.sort((a, b) => a.date.getTime() - b.date.getTime() || String(a.image).localeCompare(String(b.image))) ?? undefined
})
const tracks = computed<RichTrack[] | undefined>(() => {
  return trackData.value?.filter(a => a.year === year.value)?.sort((a, b) => a.date.getTime() - b.date.getTime() || String(a.image).localeCompare(String(b.image))) ?? undefined
})
</script>

<template>
  <div class="flex flex-col gap-2 bg-base-200 rounded-xl">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl">
      <div class="flex items-center gap-5 text-5xl font-extrabold">
        <NuxtLink :to="`/releases/${year-1}`"><button class="btn join-item"><ChevronLeftIcon class="text-info" /> {{ year-1 }}</button></NuxtLink>
        {{ year }}
        <NuxtLink :to="`/releases/${year+1}`" v-if="year < 2026"><button class="btn join-item">{{ year+1 }} <ChevronRightArrow class="text-info" /></button></NuxtLink>
      </div>
    </div>

    <div class="flex flex-col p-5 gap-3">
      <BaseTrackView :isAlbum="true" :items="albums" :releasePage="true" />
      <BaseTrackView :isAlbum="false" :items="tracks" :releasePage="true" />
    </div>
  </div>
</template>

<style scoped>

</style>