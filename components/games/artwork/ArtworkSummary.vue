<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<ArtworkContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <div class="flex gap-2 max-w-[600px]">
    <div class="shrink">
      <img :src="container.track.getImageUrl()" :alt="container.track.title"
           class="w-full h-auto rounded-xl shrink shadow-md"/>
    </div>
    <div class="shrink">
      <img :src="`${getLocalArtwork(container.imgName)}`" alt="Blank artwork"
           class="w-full h-auto rounded-xl shrink shadow-md"/>
    </div>
  </div>
</template>

<style scoped>

</style>