<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ArtworkDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<ArtworkContainer>, required: true },
  pointer: { type: Boolean, default: true }
})

const spotifyLoaded = ref(false)
const localLoaded = ref(false)
const localError = ref(false)
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="w-full flex gap-2">
      <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2 relative aspect-square">
        <div v-if="!spotifyLoaded" class="skeleton w-full h-full rounded-xl absolute inset-0"></div>
        <img :src="instance.track.getImageUrl()"
             :alt="instance.track.title"
             @load="spotifyLoaded = true"
             :class="['w-full h-auto rounded-xl shrink shadow-md transition-opacity duration-300', spotifyLoaded ? 'opacity-100' : 'opacity-0']"/>
      </div>

      <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2 relative aspect-square">
        <div v-if="!localLoaded && !localError" class="skeleton w-full h-full rounded-xl absolute inset-0"></div>
        
        <div v-if="localError || !instance.imgName" class="w-full h-full rounded-xl bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
           <span class="text-xs opacity-50 text-center px-1">Not found</span>
        </div>

        <img v-if="instance.imgName"
             :src="`${getLocalArtwork(instance.imgName)}`" 
             alt="Blank artwork"
             @load="localLoaded = true"
             @error="localError = true"
             :class="['w-full h-auto rounded-xl shrink shadow-md transition-opacity duration-300', localLoaded ? 'opacity-100' : 'opacity-0']"/>
      </div>
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>