<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import {ref} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import WordlePreview from "~/components/games/wordle/WordlePreview.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {watchOnce} from "@vueuse/shared";
import {getDashboardArtists} from "~/utils/dashboard";
import CpuChipIcon from "~/components/icons/CpuChipIcon.vue";
import WordleString from "~/components/games/wordle/WordleString.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const { data, pending, error } = await useAsyncData<WordleContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: artists } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })
const instances = ref<WordleContainer[] | undefined>()
const editing = ref<WordleContainer | undefined>()

const inputOptions = computed<string[]>(() => {
  if(editing.value?.artist && artists.value) {
    return artists.value
        .toSorted((a, b) => (b.listeners ?? 0) - (a.listeners ?? 0))
        .map(a => a.name)
        .filter(a => a.length === editing.value?.artist.name.length)
        .filter(a => /^[a-zA-Z,-]*$/.test(a))
  }

  return []
})

watchOnce(data, () => instances.value = data.value)
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
      v-model:instances="instances"
      v-model:editing="editing"
      :gameDef="gameDef"
    >
      <template #previewBody="{ instance, clicked }">
        <WordlePreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.artist">{{ editing.artist.getDisplayName() }}</div>
          <ArtistPicker @selected="a => (editing!!.artist = a.toFlatArtist())" :title="editing!!.artist ? 'Replace' : 'Select'"
            :filter="a => /^[a-zA-Z,-]*$/.test(a.name)"/>
        </div>
      </template>

      <template #editBody v-if="editing">
        <WordleString :guess="editing.artist.name" :solution="editing.artist.name" v-if="editing.artist" />

        <div class="collapse collapse-arrow bg-base-100 border-base-300 border w-5/7 my-5" v-if="editing.artist">
          <input type="checkbox" />

          <div class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12 flex gap-1">
            <CpuChipIcon class="text-info" />
            Possible inputs ({{ inputOptions.length }})
          </div>
          <div class="collapse-content text-sm">
            <div class="flex flex-col gap-1">
              <div class="flex gap-1 items-center" v-for="(option, index) in inputOptions" :key="index">
                <WordleString :guess="option" :solution="editing.artist.name" />
              </div>
            </div>
          </div>
        </div>
        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>