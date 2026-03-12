<script setup lang="ts">
import {RichAlbum, RichTrack} from "~/types/content";
import BaseTrackCard from "~/components/dashboard/content/BaseTrackCard.vue";
import ArrowTopRightOpenIcon from "~/components/icons/ArrowTopRightOpenIcon.vue";

const props = defineProps({
  isAlbum: { type: Boolean, required: true },
  items: { type: Object as PropType<RichAlbum[] | RichTrack[] | undefined>, required: true },
  count: { type: Number },
  frontpage: { type: Boolean, default: false },
})
const isAlbum = computed(() => props.isAlbum)
const items = computed(() => props.items)
const count = computed(() => props.count ?? (items.value?.length ?? 0))
</script>

<template>
  <div class="border border-neutral/50 rounded-lg p-4" v-if="items === undefined || items.length > 0">
    <h2 class="text-2xl font-black flex gap-1 items-center">
      <template v-if="isAlbum">
        Albums
      </template>
      <template v-else>
        Tracks
      </template>
      <span class="badge badge-soft badge-info" v-if="items && items.length > 0">{{ count }}</span>
      <NuxtLink :to="props.isAlbum ? '/admin/content/albums' : '/admin/content/tracks'">
        <button class="btn btn-soft btn-sm" v-if="props.frontpage">
          <div class="flex gap-1 items-center">
            <p>search</p>
            <ArrowTopRightOpenIcon class="size-4" />
          </div>
        </button>
      </NuxtLink>
    </h2>

    <div class="flex flex-wrap gap-2 mt-2">
      <template v-for="item in items" :key="item.sid" v-if="items">
        <BaseTrackCard :item="item" />
      </template>

      <template v-for="index in 10" :key="index" v-else>
        <div class="flex flex-col gap-1 p-2 border border-neutral/0">
          <div class="skeleton h-[130px] w-[130px]"></div>
          <div class="skeleton h-5 w-[130px]"></div>
          <div class="skeleton h-5 w-[130px]"></div>
          <div class="skeleton h-5 w-[50px]"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>