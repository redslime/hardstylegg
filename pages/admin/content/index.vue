<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardArtists, getDashboardTracks} from "~/utils/dashboard";
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import {RichAlbum, RichArtist, RichTrack} from "~/types/content";
import BaseTrackView from "~/components/dashboard/content/BaseTrackView.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import {pickRandomItems} from "~/utils/utils";
import ArrowTopRightOpenIcon from "~/components/icons/ArrowTopRightOpenIcon.vue";

definePageMeta({
  middleware: ['authenticated'],
})

const { data: artists } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })
const { data: albums } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const { data: tracks } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })

const filterHardstyle = ref<boolean>(true)
const filterTrackMinimum = 35
const topVisible = ref<boolean>(false)
const top = computed<RichArtist[]>(() => {
  if(topVisible.value && artists.value && tracks.value) {
    return artists.value
        .filter(a => a.listeners != null)
        .toSorted((a, b) => b.listeners!! - a.listeners!!)
        .filter(a => {
          if(filterHardstyle.value) {
            const featuredOn = tracks.value?.filter(t => t.artists.map(a => a.id).includes(a.id)).length ?? 0
            return featuredOn >= filterTrackMinimum
          } else return true
        })
        .slice(0, 100)
  } else {
    return []
  }
})

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

      <div class="collapse collapse-plus bg-base-300 border border-base-300 w-fit mt-6" v-if="top">
        <input type="checkbox" v-model="topVisible" />
        <div class="collapse-title font-semibold">Top 100 artists by monthly listeners</div>
        <div class="collapse-content">
          <label class="label text-sm">
            <input type="checkbox" class="toggle" v-model="filterHardstyle" />
            Only show Hardstyle artists
          </label>

          <p class="text-xs opacity-60 my-2" v-if="filterHardstyle">Must have at least 35 releases to show up here</p>

          <div class="flex flex-col gap-1">
            <div v-for="(artist, index) in top" :key="artist.id"
                class="flex gap-2 items-center border border-white/10 hover:bg-base-100 cursor-pointer transition-colors rounded-sm p-1"
                @click="navigateTo(`/admin/content/artist/${artist.id}`)">
              <p class="w-4 font-mono opacity-60">{{index+1}}</p>

              <img :src="artist.getImageUrl()" :alt="artist.name" class="size-11 rounded-full object-cover" />

              <div class="flex flex-col gap-1">
                <p class="font-semibold">{{ artist.getDisplayName() }}</p>
                <p class="text-xs tracking-tight">{{ artist.getListenersFriendly() }} listeners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseTrackView :isAlbum="true" :items="albumSelection" :count="albums?.length ?? 0" :frontpage="true" />

    <BaseTrackView :isAlbum="false" :items="trackSelection" :count="tracks?.length ?? 0" :frontpage="true" />
  </div>
</template>

<style scoped>

</style>