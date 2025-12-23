<script setup lang="ts">
import type {ShallowTrack, Track} from "~/types/models";
import SpotifyIcon from "~/components/icons/SpotifyIcon.vue";
import YouTubeIcon from "~/components/icons/YouTubeIcon.vue";

const { track, isAlbum } = defineProps({
  track: { type: Object as PropType<Track | ShallowTrack>, required: true },
  isAlbum: { type: Boolean, default: false },
})

const isYouTube = computed<boolean>(() => track.sid.startsWith("yt:"))
const url = computed<string>(() => {
  if(isYouTube.value) {
    return `https://www.youtube.com/watch?v=${track.sid.replace("yt:", "")}`
  } else {
    if(isAlbum) {
      return `https://open.spotify.com/album/${track.sid}`
    } else {
      return `https://open.spotify.com/track/${track.sid}`
    }
  }
})
const isMobile = inject<boolean>("isMobile", false)
const summary = inject<boolean>("summary", false)
const details = inject<boolean>("details", false)
</script>

<template>
  <Teleport to="#spotify-dock" :disabled="!isMobile || summary || details">
    <a :href="url" target="_blank" class="btn btn-lg" :class="{'btn-spotify': !isYouTube, 'btn-youtube': isYouTube}">
      <SpotifyIcon v-if="!isYouTube" />
      <YouTubeIcon v-else />
      Listen
    </a>
  </Teleport>
</template>

<style scoped>
.btn-spotify {
  background-color: #1ED760;
  color: black;
}
.btn-youtube {
  background-color: #FF0033;
  color: white;
}
</style>