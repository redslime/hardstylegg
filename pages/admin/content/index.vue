<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardArtists, getDashboardTracks} from "~/utils/dashboard";
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import {RichAlbum, type RichArtist, RichTrack} from "~/types/content";
import BaseTrackView from "~/components/dashboard/content/BaseTrackView.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import {pickRandomItems} from "~/utils/utils";
import ArrowTopRightOpenIcon from "~/components/icons/ArrowTopRightOpenIcon.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data: artists } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })
const { data: albums } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const { data: tracks } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })

const albumSelection = computed<RichAlbum[] | undefined>(() => {
  if(albums.value) {
    return pickRandomItems(albums.value.filter(a => !a.hidden), 10)
  } else {
    return undefined
  }
})
const trackSelection = computed<RichTrack[] | undefined>(() => {
  if(tracks.value) {
    return pickRandomItems(tracks.value.filter(t => !t.hidden), 10)
  } else {
    return undefined
  }
})
const artistSelection = computed<RichArtist[] | undefined>(() => {
  if(artists.value) {
    return pickRandomItems(artists.value, 10)
  } else {
    return undefined
  }
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    Content database
  </div>

  <div class="flex flex-col gap-4">
    <div class="border border-neutral/50 rounded-lg p-4">
      <h2 class="text-2xl font-black flex gap-1 items-center">
        Artists
        <span class="badge badge-soft badge-info" v-if="artists">{{ artists.length }}</span>
        <NuxtLink :to="`/admin/content/artists`">
          <button class="btn btn-soft btn-sm">
            <div class="flex gap-1 items-center">
              <p>search</p>
              <ArrowTopRightOpenIcon class="size-4" />
            </div>
          </button>
        </NuxtLink>
      </h2>

      <div class="flex flex-wrap gap-2 mt-2">
        <template v-for="artist in artistSelection" :key="artist.id" v-if="artists">
          <ArtistCard :artist="artist" />
        </template>

        <template v-for="index in 10" :key="index" v-else>
          <div class="flex flex-col items-center gap-1 p-2">
            <div class="skeleton h-[130px] w-[130px]"></div>
            <div class="skeleton h-5 w-[130px]"></div>
          </div>
        </template>
      </div>
    </div>

    <BaseTrackView :isAlbum="true" :items="albumSelection" :count="albums?.length ?? 0" :frontpage="true" />

    <BaseTrackView :isAlbum="false" :items="trackSelection" :count="tracks?.length ?? 0" :frontpage="true" />
  </div>
</template>

<style scoped>

</style>