<script setup lang="ts">
import type {LostInTranslationContainer} from "~/types/gameModels";
import {ref} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import LostInTranslationPreview from "~/components/games/lost-in-translation/LostInTranslationPreview.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import {watchOnce} from "@vueuse/shared";
import InfoIcon from "~/components/icons/InfoIcon.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.LostInTranslationDef
const { data, pending, error } = await useAsyncData<LostInTranslationContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: existingIds } = await useAsyncData<string[]>(() => gameDef.getExistingTracks(), { lazy: true })
const instances = ref<LostInTranslationContainer[] | undefined>()
const editing = ref<LostInTranslationContainer | undefined>()

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
        <LostInTranslationPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.track">{{ editing.track.getDisplayName() }}</div>
          <TrackPicker @selected="t => (editing!!.track = t.toFlatTrack())" :title="editing!!.track ? 'Replace' : 'Select'" :existing="existingIds" />
        </div>
      </template>

      <template #editBody v-if="editing && editing.track">
        <div class="flex gap-3">
          <fieldset class="fieldset mt-2 w-1/2">
            <legend class="fieldset-legend">Original lyrics</legend>
            <textarea class="textarea w-full" rows="20" placeholder="Enter original lyrics..." v-model="editing.textOriginal"></textarea>
          </fieldset>
          <fieldset class="fieldset mt-2 w-1/2">
            <legend class="fieldset-legend">Translated lyrics</legend>
            <textarea class="textarea w-full" rows="20" placeholder="Enter translated lyrics..." v-model="editing.textTranslated"></textarea>
          </fieldset>
        </div>

        <fieldset class="fieldset mt-2">
          <legend class="fieldset-legend">Translation chain</legend>
          <input type="text" class="input w-full" placeholder="English ➔ ..." v-model="editing.translationChain" />
        </fieldset>

        <p class="mt-5 opacity-80 flex gap-1">
          <InfoIcon class="text-info" />
          Use <a class="link text-primary" href="https://www.ravbug.com/hypertranslate/" target="_blank">this site</a> to chain-translate automatically.
        </p>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>