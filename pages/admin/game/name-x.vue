<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import {computed} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import NameXPreview from "~/components/dashboard/preview/NameXPreview.vue";
import {NameXGame} from "~/utils/game/clientGameRegistry";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const gameDef = NameXGame
const { data, pending, error } = await useAsyncData<NameXContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = computed<NameXContainer[] | undefined>(() => data.value)
const editing = ref<NameXContainer | undefined>()

function del(index: number) {
  editing.value!!.items.splice(index, 1)
}
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
        <NameXPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Title" required maxlength="128"
               class="input input-lg validator w-[80ch]"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
        <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
          <li
              v-for="(track, index) in editing.items"
              :key="track.sid"
              class="relative flex items-center gap-3 py-2 px-3"
          >
            <div class="text-xl tabular-nums font-mono w-6 opacity-30">
              {{ index + 1 }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 font-semibold">
                {{ track.title }}
              </div>

              <div class="text-xs opacity-60">
                {{ track.artists }}
              </div>
            </div>

            <div class="absolute right-2">
              <button class="btn btn-error btn-xs" @click="del(index)"><TrashIcon class="size-2" /></button>
            </div>
          </li>
        </ul>

        <div class="mt-5">
          <TrackPicker :title="'Add'" @selected="t => editing!!.items.push(t)" />
        </div>

        <div class="mt-5">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Number of tracks that must be guessed correctly</legend>
            <input class="input" type="number" v-model="editing!!.goal" min="1" :max="editing.items.length" placeholder="Guess goal" required />
          </fieldset>
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>