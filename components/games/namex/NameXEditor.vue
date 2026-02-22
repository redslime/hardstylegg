<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import NameXPreview from "~/components/games/namex/NameXPreview.vue";
import {watchOnce} from "@vueuse/shared";
import type {Track} from "~/types/models";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import Checkmark from "~/components/icons/Checkmark.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NameXDef
const { data, pending, error } = await useAsyncData<NameXContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<NameXContainer[] | undefined>()
const editing = ref<NameXContainer | undefined>()
const input = ref("")
const editingIndex = ref<number>(-1)

function del(index: number) {
  editing.value!!.items.splice(index, 1)
}

function setTrackMode(editing: NameXContainer, tracks: boolean) {
  editing.tracks = tracks
  editing.items = []
  input.value = ""
}

function enter(editing: NameXContainer) {
  (editing.items as string[]).push(input.value)
  input.value = ""
}

watchOnce(data, () => instances.value = data.value)
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @saved="input = ''; editingIndex = -1"
        @cancelled="input = ''; editingIndex = -1"
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
        <h2 class="font-bold opacity-80 mb-1">Input type</h2>
        <div class="flex gap-3 items-center mb-5">
          <button class="btn btn-primary" :class="{'btn-outline': !editing.tracks}" @click="setTrackMode(editing, true)">Tracks</button>
          <button class="btn btn-primary" :class="{'btn-outline': editing.tracks}" @click="setTrackMode(editing, false)">Text</button>
        </div>

        <ul class="grid bg-base-100 rounded-box shadow-md divide-y divide-base-300 text-sm"
            :class="{ 'grid-cols-2': editing.items.length >= 10 }">
          <li
              v-for="(item, index) in editing.items"
              :key="index"
              class="relative flex items-center gap-3 py-2 px-3"
          >
            <div class="text-xl tabular-nums font-mono w-6 opacity-30">
              {{ index + 1 }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 font-semibold">
                <template v-if="editing.tracks">
                  {{ (item as Track).title }}
                </template>
                <template v-else>
                  <template v-if="editingIndex === index">
                    <input
                        v-model="editing.items[index]"
                        type="text"
                        class="input input-sm autofocus"
                        @keyup.enter="editingIndex = -1"
                        autofocus
                    />
                  </template>
                  <template v-else>
                    {{ item }}
                  </template>
                </template>
              </div>

              <div class="text-xs opacity-60" v-if="editing.tracks">
                {{ (item as Track).artists }}
              </div>
            </div>

            <div class="absolute join flex flex-row justify-center items-center right-2 h-full">
              <template v-if="index === editingIndex">
                <button class="btn btn-success btn-xs join-item h-full" @click="editingIndex = -1"><Checkmark /></button>
              </template>
              <template v-else-if="editingIndex === -1">
                <button class="btn btn-primary btn-xs join-item" v-if="!editing.tracks" @click="editingIndex = index"><PencilIcon class="size-2" /></button>
                <button class="btn btn-error btn-xs join-item" @click="del(index)"><TrashIcon class="size-2" /></button>
              </template>
            </div>
          </li>
        </ul>

        <div class="mt-5">
          <template v-if="editing.tracks">
            <TrackPicker :title="'Add'" @selected="t => editing!!.items.push(t)" />
          </template>
          <template v-else>
            <div class="join">
              <div>
                <label class="input join-item min-w-80">
                  <input type="text" maxlength="32" placeholder="Item..." v-model="input" @keyup.enter="enter(editing)" required />
                </label>
              </div>
              <button class="btn btn-soft btn-primary join-item" @click="enter(editing)">Add</button>
            </div>
          </template>
        </div>

        <div class="mt-5">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Number of items that must be guessed correctly</legend>
            <input class="input" type="number" v-model="editing!!.goal" min="1" :max="editing.items.length" placeholder="Guess goal" required />
          </fieldset>
        </div>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>