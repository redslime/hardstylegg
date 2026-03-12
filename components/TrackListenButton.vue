<script setup lang="ts">
import SpotifyIcon from "~/components/icons/SpotifyIcon.vue";
import YouTubeIcon from "~/components/icons/YouTubeIcon.vue";
import {FlatAlbum, FlatTrack} from "~/types/content";

const { track } = defineProps({
  track: { type: Object as PropType<FlatTrack | FlatAlbum>, required: true}
})

const isYouTube = track.isYouTube()
const url = computed<string>(() => track.getPlayUrl())
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