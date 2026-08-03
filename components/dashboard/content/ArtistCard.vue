<script setup lang="ts">
import type {PropType} from "vue";
import type {RichArtist} from "~/types/content";

const { artist, clickable } = defineProps({
  artist: { type: Object as PropType<RichArtist | undefined>, required: true },
  clickable: { type: Boolean, default: true },
})
const imgLoaded = ref<boolean>(false)

function navigate() {
  if(clickable && artist) {
    navigateTo(`/admin/content/artist/${artist.id}`)
  }
}
</script>

<template>
  <div class="bg-base-300 rounded-lg shadow p-2 flex flex-col justify-start border border-neutral/50"
       :class="{'transition-colors hover:border-primary cursor-pointer': clickable}"
       @click="navigate()"
      v-if="artist">
    <div class="h-[130px] w-[130px]">
      <div v-if="!imgLoaded && artist.image" class="skeleton w-full h-full rounded-full inset-0"></div>
      <img class="w-full h-full overflow-hidden object-cover rounded-full"
           @load="imgLoaded = true" v-if="artist.image" v-show="imgLoaded" :src="artist.getImageUrl()" alt="" />
      <div v-if="!artist.image" class="w-full min-h-[130px] rounded-full bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
        <span class="text-xs opacity-50 text-center px-1">No image</span>
      </div>
    </div>
    <div class="text-sm h-5 w-[130px] font-semibold text-center">{{ artist.name }}</div>
  </div>
</template>

<style scoped>

</style>