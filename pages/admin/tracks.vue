<script setup lang="ts">
import {getSpotifyArtwork} from "~/utils/utils";
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import { RecycleScroller } from 'vue-virtual-scroller'

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const {data: tracks, pending, error} = await useAsyncData(() => $fetch('/api/dashboard/tracks'), { lazy: true })
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    Track database
  </div>

  <span class="loading loading-spinner loading-xl" v-if="pending"></span>

  <div role="alert" class="alert alert-error alert-soft" v-if="error">
    <span>Failed to load tracks</span>
  </div>

  <div class="w-full" v-if="tracks">
    <RecycleScroller
        :items="tracks"
        key-field="sid"
        :item-size="10"
        class="scroller"
    >
      <template #default="{ item: track }">
        <div class="card bg-base-200 shadow-md w-60 max-w-sm mx-auto">
          <img
              :src="getSpotifyArtwork(track.cover_art!!)"
              alt="artwork"
              class="rounded-t-lg w-60 h-30 object-cover"
          />
          <div class="p-3">
            <h2 class="card-title text-base">{{ track.title }}</h2>
            <p class="text-sm text-base-content/50">{{ track.artists }}</p>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped>

</style>