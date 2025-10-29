<script setup lang="ts">
import type {ShallowTrack, Track} from "~/types/models";
import SpotifyIcon from "~/components/icons/SpotifyIcon.vue";

const { track, isAlbum } = defineProps({
  track: { type: Object as PropType<Track | ShallowTrack>, required: true },
  isAlbum: { type: Boolean, default: false },
})

const url = isAlbum ? `https://open.spotify.com/album/${track.sid}` : `https://open.spotify.com/track/${track.sid}`
const isMobile = inject<boolean>("isMobile", false)
const summary = inject<boolean>("summary", false)
const details = inject<boolean>("details", false)
</script>

<template>
  <Teleport to="#spotify-dock" :disabled="!isMobile || summary || details">
    <a :href="url" target="_blank" class="btn btn-lg btn-spotify">
      <SpotifyIcon />
      Listen
    </a>
  </Teleport>
</template>

<style scoped>
.btn-spotify {
  background-color: #1ED760;
  color: black;
}
</style>