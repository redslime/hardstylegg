<script setup lang="ts">
import type {PropType} from "vue";
import {RichAlbum, type RichTrack} from "~/types/content";

const { item } = defineProps({
  item: { type: Object as PropType<RichAlbum | RichTrack>, required: true }
})
const isAlbum = computed<boolean>(() => item instanceof RichAlbum)
const imgLoaded = ref<boolean>(false)
</script>

<template>
  <div class="rounded-lg shadow p-2 flex flex-col justify-start
      border border-neutral/50 transition-colors hover:border-primary cursor-pointer"
       :class="{ 'bg-base-300': !item.hidden, 'bg-black/50 border-dashed': item.hidden }"
      @click="isAlbum ? navigateTo(`/admin/content/album/${item.sid}`) : navigateTo(`/admin/content/track/${item.sid}`)">
    <div class="h-[130px] w-[130px]">
      <div v-if="!imgLoaded && item.image" class="skeleton w-full h-full rounded-xl inset-0"></div>
      <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-xl"
           @load="imgLoaded = true" :src="item.getImageUrl()" v-if="item.image" alt="" />
      <div v-if="!item.image" class="w-full min-h-[130px] rounded-xl bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
        <span class="text-xs opacity-50 text-center px-1">No image</span>
      </div>
    </div>
    <div class="max-w-[130px]">
      <div class="text-sm font-semibold">{{ item.title }}</div>
      <div class="text-sm opacity-70">
        <template v-for="(artist, index) in item.artists" :key="index">
          <span class="hover:underline hover:text-white cursor-pointer">
            <NuxtLink :to="`/admin/content/artist/${artist.id}`">
              {{ artist.getDisplayName() }}
            </NuxtLink>
          </span>
          <span v-if="index !== item.artists.length-1"> & </span>
        </template>
      </div>
      <div class="text-xs opacity-70">
        <span class="hover:underline hover:text-white cursor-pointer">
          <NuxtLink :to="`/admin/content/year/${item.year}`">
            {{ item.year }}
          </NuxtLink>
        </span>
      </div>
      <div class="badge badge-neutral badge-xs tooltip" v-if="item.hidden"
           data-tip="Hidden tracks don't show up in user-facing input suggestions">
        hidden
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>