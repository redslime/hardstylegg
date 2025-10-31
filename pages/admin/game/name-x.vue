<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import {getNameXData} from "~/utils/dashboard";
import {computed} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateNameX} from "~/utils/gameValidators";
import ListBullet from "~/components/icons/game/ListBullet.vue";
import {getName} from "~/utils/tracks";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<NameXContainer[]>(() => getNameXData(), { lazy: true })
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
        :validator="() => validateNameX(editing!!)"
        :editUrl="'/api/dashboard/edit/name-x'"
        :typeId="5"
        :typeName="'Name X'"
        :icon="ListBullet"
        :title="t => t.title"
    >
      <template #previewBody="{ instance }">
        <div v-for="track in instance.items" :key="track.sid" class="badge badge-outline">
          {{ getName(track) }}
        </div>
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Quiz title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
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
            <input class="input focus:outline-none focus:ring-0" type="number" v-model="editing!!.goal" min="1" :max="editing.items.length" placeholder="Guess goal" required />
          </fieldset>
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>