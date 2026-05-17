<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardLists} from "~/utils/dashboard";
import {FlatAlbum, type RichAlbum} from "~/types/content";
import BaseTrackHeader from "~/components/dashboard/content/BaseTrackHeader.vue";
import type {List} from "~/types/models";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: albums, pending } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const { data: lists } = await useAsyncData("lists", () => getDashboardLists(), { lazy: true })

const album = computed<RichAlbum | undefined>(() => albums.value?.find(a => a.sid === id.value))
const linkedLists = computed<List[]>(() => lists.value?.filter(l => l.type === 'album').filter(l => l.items.map(t => (t.item as FlatAlbum).sid).includes(id.value)) ?? [])
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" />

  <div class="flex flex-col gap-2 bg-base-200 rounded-xl" v-if="album">
    <BaseTrackHeader :item="album" :linkedLists="linkedLists" />

    <div class="flex flex-col p-5 gap-3">
      <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
        <li
            v-for="(item, index) in album.tracks"
            :key="item.sid"
            class="flex items-center gap-3 py-2 px-3"
        >
          <div class="text-xl tabular-nums font-mono w-6 opacity-30">
            {{ index + 1 }}
          </div>

          <div class="flex-1">
            <div class="w-fit font-semibold flex items-center gap-2 hover:underline hover:text-white cursor-pointer">
              <NuxtLink :to="`/admin/content/track/${item.sid}`">
                {{ item.title }}
              </NuxtLink>
            </div>

            <div class="text-xs opacity-60">
              <template v-for="(artist, index) in item.artists" :key="index">
                <span class="hover:underline hover:text-white cursor-pointer">
                  <NuxtLink :to="`/admin/content/artist/${artist.id}`">
                    {{ artist.getDisplayName() }}
                  </NuxtLink>
                </span>
                <span v-if="index !== item.artists.length-1"> & </span>
              </template>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>