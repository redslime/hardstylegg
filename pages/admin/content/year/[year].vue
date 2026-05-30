<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardTracks} from "~/utils/dashboard";
import {RichAlbum, RichTrack} from "~/types/content";
import BaseTrackView from "~/components/dashboard/content/BaseTrackView.vue";
import ChevronRightArrow from "~/components/icons/ChevronRightArrow.vue";
import ChevronLeftIcon from "~/components/icons/ChevronLeftIcon.vue";

definePageMeta({
  middleware: ['authenticated'],
})

const route = useRoute()
const year = computed<number>(() => Number(route.params.year as string))
const { data: trackData, pending } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })
const { data: albumData, pending: ap } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })

const albums = computed<RichAlbum[]>(() => {
  return albumData.value?.filter(a => a.year === year.value)?.sort((a, b) => a.date.getTime() - b.date.getTime() || String(a.image).localeCompare(String(b.image))) ?? []
})
const tracks = computed<RichTrack[]>(() => {
  return trackData.value?.filter(a => a.year === year.value)?.sort((a, b) => a.date.getTime() - b.date.getTime() || String(a.image).localeCompare(String(b.image))) ?? []
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending || ap" />

  <div class="flex flex-col gap-2 bg-base-200 rounded-xl">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl">
      <div class="flex items-center gap-5 text-5xl font-extrabold">
        <NuxtLink :to="`/admin/content/year/${year-1}`"><button class="btn join-item"><ChevronLeftIcon class="text-info" /> {{ year-1 }}</button></NuxtLink>
        {{ year }}
        <NuxtLink :to="`/admin/content/year/${year+1}`"><button class="btn join-item">{{ year+1 }} <ChevronRightArrow class="text-info" /></button></NuxtLink>
      </div>
    </div>

    <div class="flex flex-col p-5 gap-3">
      <BaseTrackView :isAlbum="true" :items="albums" />
      <BaseTrackView :isAlbum="false" :items="tracks" />
    </div>
  </div>
</template>

<style scoped>

</style>