<script setup lang="ts">
import type {Track} from "~/types/models";

const { tracks, albums } = defineProps({
  tracks: { type: Array as PropType<Track[]>, required: true },
  albums: { type: Array as PropType<Track[]>, required: true }
})

const selected = ref<Track>()
const otherIds = computed<string[]>(() => tracks.filter(t => selected.value !== undefined && t.sid !== selected.value?.sid).map(t => t.sid))

function select(track: Track): boolean {
  selected.value = track
  otherIds.value.forEach(sid => $fetch('/api/delete?sid=' + sid))
  return true
}

function getAlbum(track: Track): Track | undefined {
  return albums.find(a => a.cover_art === track.cover_art)
}
</script>

<template>
  <div class="flex flex-wrap gap-4 justify-center">
    <div class="p-3 rounded-lg" v-for="(track, index) in tracks" :key="index" style="max-width: 242px;"
        :class="{
          'bg-base-200': track.sid !== selected?.sid,
          'bg-success text-success-content': track.sid === selected?.sid,
        }">
      <img class="cursor-pointer" :src="`https://i.scdn.co/image/${track.cover_art}`" alt="" width="200px" @click="select(track)" />
      <p class="text-center">{{ track.year }} <span><a class="link" target="_blank" :href="'https://open.spotify.com/track/' + track.sid">spotify</a></span></p>
      <p class="text-center">{{ track.sid }}</p>
      <p v-if="getAlbum(track) !== undefined" class="text-center">Part of: {{ getAlbum(track)!!.title }}</p>
    </div>
  </div>
  Deleting: {{ otherIds }}
</template>

<style scoped>

</style>