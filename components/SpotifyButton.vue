<script setup lang="ts">
import type {ShallowTrack, Track} from "~/types/models";
import SpotifyIcon from "~/components/icons/SpotifyIcon.vue";

const { track } = defineProps({
  track: { type: Object as PropType<Track | ShallowTrack>, required: true },
})
const url = `https://open.spotify.com/track/${track.sid}`
</script>

<template>
  <a :href="url" target="_blank" class="btn btn-lg btn-spotify">
    <SpotifyIcon />
    Listen
  </a>
</template>

<style scoped>
.btn-spotify {
  background-color: #1ED760;
  color: black;
}
</style>