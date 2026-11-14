<script setup lang="ts">
import {RichAlbum, RichTrack} from "~/types/content";
import BaseTrackCard from "~/components/dashboard/content/BaseTrackCard.vue";
import ArrowTopRightOpenIcon from "~/components/icons/ArrowTopRightOpenIcon.vue";

const props = withDefaults(defineProps<{
  isAlbum: boolean,
  items: RichAlbum[] | RichTrack[] | undefined,
  count?: number,
  frontpage?: boolean,
  releasePage?: boolean
}>(), {
  frontpage: false,
  releasePage: false
})
const isAlbum = computed(() => props.isAlbum)
const items = computed(() => props.items)
const count = computed(() => props.count ?? (items.value?.length ?? 0))
const months = computed(() => [...new Set(items.value?.map(i => i.date?.getMonth()) ?? [])])

const monthNames = [ "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" ];
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

    <template v-if="items">
      <template v-if="months && months.length > 0 && releasePage && !isAlbum">
        <template v-for="month in months" :key="month">
          <div class="flex gap-1 items-center flex-0 my-6 ml-4">
            <h2 class="text-xl">{{ monthNames[month] }}</h2>
            <hr class="grow">
          </div>

          <div class="flex flex-wrap gap-2 mt-2">
            <template v-for="item in items.filter(t => t.date?.getMonth() === month)" :key="item.sid">
              <BaseTrackCard :item="item" :preview="props.releasePage" :exactDate="props.releasePage" />
            </template>
          </div>
        </template>
      </template>

      <div class="flex flex-wrap gap-2 mt-2" v-else>
        <template v-for="item in items" :key="item.sid">
          <BaseTrackCard :item="item" :preview="props.releasePage" :exactDate="props.releasePage" />
        </template>
      </div>
    </template>

    <div class="flex flex-wrap gap-2 mt-2" v-else>
      <template v-for="index in 10" :key="index">
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