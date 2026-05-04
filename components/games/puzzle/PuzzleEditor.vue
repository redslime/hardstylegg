<script setup lang="ts">
import type {PuzzleContainer} from "~/types/gameModels";
import {watchOnce} from "@vueuse/shared";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import PuzzlePreview from "~/components/games/puzzle/PuzzlePreview.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import {RichArtist, type RichTrack} from "~/types/content";
import type {PuzzleItem} from "~/utils/game/impl/ClientPuzzleGame";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.PuzzleDef
const { data, pending, error } = await useAsyncData<PuzzleContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<PuzzleContainer[] | undefined>()
const editing = ref<PuzzleContainer | undefined>()

const poolElements = ref<PuzzleItem[]>([])

function reset() {
  poolElements.value = []
}

function addTrack(track: RichTrack) {
  if(editing.value && !editing.value.tracks.map(t => t.sid).includes(track.sid)) {
    editing.value.tracks.push(track)
    calculateElements()
  }
}

function removeTrack(track: RichTrack) {
  if(editing.value) {
    editing.value.tracks.splice(editing.value.tracks.indexOf(track), 1)
    calculateElements()
  }
}

function calculateElements() {
  if(editing.value) {
    poolElements.value = gameDef.calculatePoolItems(editing.value)
  }
}

watchOnce(data, () => instances.value = data.value)
watch(editing, val => {
  if(val) {
    if(!val.tracks) {
      val.tracks = []
    }

    calculateElements()
  }
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @cancelled="reset()"
        @saved="reset()"
    >
      <template #previewBody="{ instance, clicked }">
        <PuzzlePreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" :value="gameDef.getIconPreviewTitle(editing!!)" class="input input-lg w-[80ch]" readonly />
      </template>

      <template #editBody v-if="editing">
        <div class="bg-base-300 indicator flex gap-4 border border-white/5 p-4 rounded-md mt-6 pt-6 min-w-80">
          <div class="flex gap-2 indicator-item indicator-start ml-22">
            <span class="badge badge-info font-semibold">
              Tracks
            </span>
            <TrackPicker :style="'badge badge-soft badge-success hover:badge-outline cursor-pointer'"
                         :title="'Add'" :button="false" @selected="addTrack" :existing="editing.tracks.map(t => t.sid)" />
          </div>

          <template v-for="(track, index) in editing.tracks" :key="index">
            <div class="rounded-lg shadow p-2 flex flex-col justify-start border border-neutral/50 indicator">
              <span class="indicator-item indicator-end badge badge-soft badge-sm badge-error hover:badge-outline cursor-pointer"
                  @click="removeTrack(track)">
                X
              </span>

              <div class="h-[130px] w-[130px]">
                <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-xl"
                     :src="track.getImageUrl()" v-if="track.image" :alt="track.getDisplayName()" />
              </div>
              <div class="max-w-[130px]">
                <div class="text-sm font-semibold">
                  {{ track.title }}
                </div>
                <div class="text-sm opacity-70">
                  <template v-for="(artist, index) in track.artists" :key="index">
                    {{ artist.getDisplayName() }}
                    <span v-if="index !== track.artists.length-1"> & </span>
                  </template>
                </div>
                <div class="text-xs opacity-70">
                  {{ track.year }}
                </div>
              </div>
            </div>
          </template>

          <div v-if="editing.tracks.length === 0">
            Added tracks will show up here
          </div>
        </div>

        <div class="bg-base-200 border border-white/5 w-full p-5 min-h-16 max-w-200 mb-10 rounded-lg indicator mt-5" v-if="poolElements.length > 0">
          <span class="indicator-item indicator-center badge badge-sm badge-secondary font-semibold">
            Puzzle pool
          </span>

          <div class="flex flex-row flex-wrap justify-center gap-4">
            <div v-for="element in poolElements" :key="element.id"
                 class="badge badge-soft badge-xl font-semibold"
                 :class="{
                  'pl-0 badge-secondary': element.type === 'artist',
                  'badge-warning': element.type === 'title'
                  }">
              <div class="flex gap-1 items-center" v-if="element.val instanceof RichArtist">
                <img
                    :src="element.val.getImageUrl()"
                    class="rounded-full w-4 md:w-8 h-4 md:h-8 overflow-hidden object-cover"
                    :alt="element.val.getDisplayName()"
                />
                <p>{{ element.val.name }}</p>
              </div>

              <p v-else>{{ element.val }}</p>
            </div>
          </div>
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>