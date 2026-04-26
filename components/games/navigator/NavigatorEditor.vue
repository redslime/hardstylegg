<script setup lang="ts">
import type {NavigatorContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import NavigatorPreview from "~/components/games/navigator/NavigatorPreview.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import ArrowRightIcon from "~/components/icons/ArrowRightIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NavigatorDef
const { data, pending, error } = await useAsyncData<NavigatorContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<NavigatorContainer[] | undefined>()
const editing = ref<NavigatorContainer | undefined>()

watchOnce(data, () => instances.value = data.value)
watch(editing, (val) => {
  if(val && !val.steps) {
    val.steps = 2
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
    >
      <template #previewBody="{ instance, clicked }">
        <NavigatorPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" :value="gameDef.getIconPreviewTitle(editing!!)" class="input input-lg w-[80ch]" readonly />
      </template>

      <template #editBody v-if="editing">
        <div class="flex gap-5 mb-3 justify-around w-fit">
          <div class="p-4 text-center">
            <h2 class="mb-4 font-bold">From:</h2>
            <ArtistCard :artist="editing.from" :clickable="false" class="mb-2" />
            <ArtistPicker :title="editing.from ? 'Replace' : 'Select'" @selected="a => editing!!.from = a" />
          </div>

          <div class="content-center">
            <ArrowRightIcon class="size-10" />
          </div>

          <div class="p-4 text-center">
            <h2 class="mb-4 font-bold">To:</h2>
            <ArtistCard :artist="editing.to" :clickable="false" class="mb-2" />
            <ArtistPicker :title="editing.to ? 'Replace' : 'Select'" @selected="a => editing!!.to = a" />
          </div>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Max steps</legend>
          <input class="input validator" type="number" min="1" placeholder="Max steps"
                 required v-model="editing.steps" />
        </fieldset>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>