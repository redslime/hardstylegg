<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardLists, getDashboardTracks} from "~/utils/dashboard";
import {FlatTrack, type RichAlbum, type RichTrack} from "~/types/content";
import BaseTrackHeader from "~/components/dashboard/content/BaseTrackHeader.vue";
import type {List} from "~/types/models";

definePageMeta({
  middleware: ['authenticated'],
})

const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: tracks, pending } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })
const { data: albums } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const { data: lists } = await useAsyncData("lists", () => getDashboardLists(), { lazy: true })

const track = computed<RichTrack | undefined>(() => tracks.value?.find(a => a.sid === id.value))
const linkedAlbum = computed<RichAlbum | undefined>(() => albums.value?.find(a => a.tracks.map(t => t.sid).includes(id.value)))
const linkedLists = computed<List[]>(() => lists.value?.filter(l => l.type === 'track').filter(l => l.items.map(t => (t.item as FlatTrack).sid).includes(id.value)) ?? [])
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" />

  <div class="flex flex-col gap-2 bg-base-200 rounded-xl" v-if="track">
    <BaseTrackHeader :item="track" :linkedLists="linkedLists" />

    <div class="bg-info text-info-content text-xl p-5 rounded-b-xl" v-if="linkedAlbum">
      Part of album:
      <span class="hover:underline">
        <NuxtLink :to="`/admin/content/album/${linkedAlbum.sid}`">
        {{ linkedAlbum.title }}
      </NuxtLink>
      </span>
    </div>

    <div class="bg-black/40 rounded-b-xl -mt-2 h-3" v-else></div>
  </div>
</template>

<style scoped>

</style>