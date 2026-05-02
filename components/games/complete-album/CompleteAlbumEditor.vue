<script setup lang="ts">
import type {CompleteAlbumContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import Checkmark from "~/components/icons/Checkmark.vue";
import CompleteAlbumPreview from "~/components/games/complete-album/CompleteAlbumPreview.vue";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import {watchOnce} from "@vueuse/shared";
import type {RichAlbum} from "~/types/content";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.CompleteAlbumDef
const { data, pending, error } = await useAsyncData<CompleteAlbumContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: existingIds } = await useAsyncData<string[]>(() => gameDef.getExistingTracks(), { lazy: true })
const instances = ref<CompleteAlbumContainer[] | undefined>()
const editing = ref<CompleteAlbumContainer | undefined>()
const editingIndex = ref<number | undefined>(-1)

watchOnce(data, () => instances.value = data.value)

function selectAlbum(album: RichAlbum) {
  editing.value!!.album = album.toFlatAlbum()
  editing.value!!.items = []

  album.tracks.forEach(track => {
    editing.value!!.items.push({name: track.title, artist: track.getArtistsString(), hidden: false, context: null})
  })
}

function del(index: number) {
  editing.value!!.items.splice(index, 1)
}

function add() {
  editing.value!!.items.push({name: "", artist: "", hidden: false, context: null})
  editingIndex.value = editing.value!!.items.length - 1
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @cancelled="editingIndex = -1"
        @saved="editingIndex = -1"
    >
      <template #previewBody="{ instance, clicked }">
        <CompleteAlbumPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.album">{{ editing.album?.getDisplayName() }}</div>
          <TrackPicker :albums="true" @selected="a => selectAlbum(a as RichAlbum)" :title="editing!!.album ? 'Replace' : 'Select'" :existing="existingIds" />
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
                      autofocus
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
                <button class="btn btn-primary btn-xs join-item" @click="editingIndex = index"><PencilIcon class="size-2" /></button>
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

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>