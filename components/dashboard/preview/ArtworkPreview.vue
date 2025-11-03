<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";
import {getSpotifyArtwork} from "~/utils/utils";
import {getName} from "~/utils/tracks";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<ArtworkContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="1" :pointer="pointer" :container="instance" :title="getName(instance.track)">
    <div class="w-full flex gap-2">
      <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
        <img :src="`${getSpotifyArtwork(instance.track.cover_art)}`" :alt="instance.track.title"
             class="w-full h-auto rounded-xl shrink shadow-md"/>
      </div>
      <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2">
        <img :src="`${getLocalArtwork(instance.artwork_blank)}`" alt="Blank artwork"
             class="w-full h-auto rounded-xl shrink shadow-md"/>
      </div>
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>