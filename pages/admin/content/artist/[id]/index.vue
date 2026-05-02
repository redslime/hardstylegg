<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardArtists, getDashboardTracks} from "~/utils/dashboard";
import {RichAlbum, type RichArtist, RichTrack} from "~/types/content";
import BaseTrackView from "~/components/dashboard/content/BaseTrackView.vue";
import PencilIcon from "~/components/icons/PencilIcon.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: artists, pending, error } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })
const { data: albums, pending: ap } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const { data: tracks, pending: tp } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })

const artist = computed<RichArtist | undefined>(() => artists.value?.find(a => a.id === id.value))

function getAlbums(): RichAlbum[] {
  if(artist.value && albums.value) {
    return albums.value
        .filter(a => a.artists.find(a => a.id === artist.value!!.id))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  return []
}

function getTracks(): RichTrack[] {
  if(artist.value && tracks.value) {
    return tracks.value
        .filter(a => a.artists.find(a => a.id === artist.value!!.id))
        .sort((a, b) => (b.date.getTime() - a.date.getTime()) || String(a.image).localeCompare(String(b.image)))
  }

  return []
}

</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending || ap || tp" :error="error" />

  <div class="flex flex-col gap-2 bg-base-200 rounded-xl" v-if="artist">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl relative">
      <div class="absolute top-5 right-5" v-if="user.admin">
        <button class="btn btn-accent btn-soft btn-lg" @click="navigateTo(`/admin/content/artist/${artist.id}/edit`)">
          <PencilIcon />
          Edit
        </button>
      </div>

      <div class="flex items-center gap-5">
        <img :src="artist.getImageUrl()" class="size-30 rounded-full object-cover" alt="Artist image" v-if="artist.image" />
        <div class="flex flex-col gap-2">
          <div class="text-5xl font-extrabold">
            {{ artist?.name }}
          </div>
          <div class="opacity-80 text-lg font-light" v-if="artist?.listeners">
            {{ artist?.getListenersFriendly() }} monthly listeners
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col p-5 gap-3">
      <BaseTrackView :isAlbum="true" :items="getAlbums()" />
      <BaseTrackView :isAlbum="false" :items="getTracks()" />
    </div>
  </div>
</template>

<style scoped>

</style>