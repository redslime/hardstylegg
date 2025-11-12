<script setup lang="ts">
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {computed} from "vue";
import {getCompleteAlbumData} from "~/utils/dashboard";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateCompleteAlbum} from "~/utils/gameValidators";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import {getName} from "~/utils/tracks";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import Pencil from "~/components/icons/game/Pencil.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import {GameState} from "~/types/models";
import Checkmark from "~/components/icons/Checkmark.vue";
import CompleteAlbumPreview from "~/components/dashboard/preview/CompleteAlbumPreview.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<CompleteAlbumContainer[]>(() => getCompleteAlbumData(), { lazy: true })
const instances = computed<CompleteAlbumContainer[] | undefined>(() => data.value)
const editing = ref<CompleteAlbumContainer | undefined>()
const editingIndex = ref<number | undefined>(-1)

function del(index: number) {
  editing.value!!.items.splice(index, 1)
}

function add() {
  editing.value!!.items.push({name: "", artist: "", hidden: false})
  editingIndex.value = editing.value!!.items.length - 1
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :validator="() => validateCompleteAlbum(editing!!)"
        :editUrl="'/api/dashboard/edit/complete-album'"
        :typeId="2"
        :typeName="'Complete Album'"
        :icon="PencilSquare"
        :title="a => getName(a.album!!)"
    >
      <template #previewBody="{ instance, clicked }">
        <CompleteAlbumPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.album">{{ getName(editing.album!!) }}</div>
          <TrackPicker :albums="true" @selected="t => (editing!!.album = t)" :title="editing!!.album ? 'Replace' : 'Select'" />
        </div>
      </template>

      <template #editBody v-if="editing && editing.album">
        <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
          <li
              v-for="(item, index) in editing.items"
              :key="index"
              class="relative flex items-center gap-3 py-2 px-3"
          >
            <div class="text-xl tabular-nums font-mono w-6 opacity-30">
              {{ index + 1 }}
            </div>

            <div class="flex-1">
              <div class="font-semibold flex items-center gap-2">
                <template v-if="editingIndex === index">
                  <input
                      v-model="item.name"
                      type="text"
                      class="input input-sm"
                  />
                </template>

                <template v-else>
                  <div class="badge badge-outline badge-info badge-sm hover:badge-primary cursor-pointer" v-if="item.hidden" @click="item.hidden = !item.hidden">
                    {{ item.name }}
                  </div>
                  <div class="hover:bg-white/10 rounded-md cursor-pointer" @click="item.hidden = !item.hidden" v-else>
                    {{ item.name }}
                  </div>
                </template>
              </div>

              <div class="text-xs opacity-60">
                <div class="font-semibold flex items-center gap-2">
                  <template v-if="editingIndex === index">
                    <input
                        v-model="item.artist"
                        type="text"
                        class="input input-xs"
                        @keyup.enter="editingIndex = -1"
                    />
                  </template>
                  <template v-else>
                    {{ item.artist }}
                  </template>
                </div>
              </div>
            </div>

            <div class="absolute join join-vertical flex flex-col right-2 h-full">
              <template v-if="index === editingIndex">
                <button class="btn btn-success btn-xs join-item h-full" @click="editingIndex = -1"><Checkmark /></button>
              </template>
              <template v-else-if="editingIndex === -1">
                <button class="btn btn-primary btn-xs join-item" @click="editingIndex = index"><Pencil class="size-2" :state="GameState.PLAYING" /></button>
                <button class="btn btn-error btn-xs join-item" @click="del(index)"><TrashIcon class="size-2" /></button>
              </template>
            </div>
          </li>
        </ul>

        <p class="mt-5 opacity-80 flex gap-1">
          <InfoIcon class="text-info" />
          Click on individual tracks to toggle them.
        </p>
        <button class="btn btn-soft btn-primary mt-5" @click="add()">Add track</button>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>