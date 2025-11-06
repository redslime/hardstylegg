<script setup lang="ts">
import {type Track} from "~/types/models";
import DuplicateTrackGroup from "~/components/DuplicateTrackGroup.vue";

definePageMeta({
  middleware: ['authenticated-admin'],
  layout: 'wide',
})

const { loggedIn, user, fetch: refreshSession } = useUserSession()
const tracks = await $fetch<Track[]>('/api/duplicates')
const albums = await $fetch<Track[]>('/api/albums')

const grouped: Record<string, Track[]> = {}
tracks.forEach(track => {
  const key = (track.artists + " - " + track.title).toLowerCase()
  if (!grouped[key]) {
    grouped[key] = []
  }
  grouped[key].push(track)
})

Object.entries(grouped).forEach(([key, value]) => {
  value.sort((a, b) => a.year - b.year)
})
</script>

<template>
  <div class="flex flex-wrap gap-4 justify-center">
    <div class="my-3" v-for="([key, value], index) of Object.entries(grouped)" :key="index">
      <div class="text-3xl font-bold bg-primary text-primary-content p-2 mb-4">
        {{ key }}
      </div>
      <DuplicateTrackGroup :tracks="value" :albums="albums" />
    </div>
  </div>
</template>

<style scoped>

</style>