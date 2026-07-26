<script setup lang="ts" generic="T extends BaseTrack">
import {type BaseTrack, RichTrack} from "~/types/content";
import {findDuplicates} from "~/utils/duplicates";
import BaseTrackCard from "~/components/dashboard/content/BaseTrackCard.vue";

const { tracks } = defineProps({
  tracks: { type: Array as PropType<RichTrack[]>, required: true }
})
const duplicates = computed<Record<string, RichTrack[]>>(() => findDuplicates(tracks))
const problemDuplicates = computed<Record<string, RichTrack[]>>(() => Object.fromEntries(Object.entries(duplicates.value)
    .filter(([_, tracks]) => tracks.filter(t => !t.hidden).length - tracks.filter(t => t.hidden).length > 0)))
</script>

<template>
  <div>
    <div class="flex flex-wrap items-stretch gap-3">
      <template v-for="(tracks, name) in problemDuplicates" :key="name">
        <div class="border border-warning rounded-3xl">
          <div class="alert alert-warning rounded-b-none">
            <div class="flex gap-2 items-center">
              <span class="font-semibold">{{ name }}</span>
              <span class="text-sm opacity-70">({{ tracks.length }} duplicates)</span>
            </div>
          </div>

          <div class="p-3 flex gap-2">
            <template v-for="track in tracks" :key="track.sid">
              <BaseTrackCard :item="track" />
            </template>
          </div>
        </div>
      </template>
    </div>

    <div class="collapse bg-base-300 border border-base-300 w-fit mt-6">
      <input type="checkbox" />
      <div class="collapse-title font-semibold">All duplicates</div>
      <div class="collapse-content">
        <div class="flex flex-wrap items-stretch gap-3">
          <template v-for="(tracks, name) in duplicates" :key="name">
            <div>
              <div class="alert alert-warning rounded-b-none">
                <div class="flex gap-2 items-center">
                  <span class="font-semibold">{{ name }}</span>
                  <span class="text-sm opacity-70">({{ tracks.length }} duplicates)</span>
                </div>
              </div>

              <div class="border border-warning rounded-lg p-3 rounded-t-none flex gap-2">
                <template v-for="track in tracks" :key="track.sid">
                  <BaseTrackCard :item="track" />
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>