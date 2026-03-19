<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import {ref} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import WordlePreview from "~/components/games/wordle/WordlePreview.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const { data, pending, error } = await useAsyncData<WordleContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<WordleContainer[] | undefined>()
const editing = ref<WordleContainer | undefined>()

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
          <ArtistPicker @selected="a => (editing!!.artist = a.toFlatArtist())" :title="editing!!.artist ? 'Replace' : 'Select'" />
        </div>
      </template>

      <template #editBody v-if="editing">
        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>