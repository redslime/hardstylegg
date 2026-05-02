<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import TrashIcon from "~/components/icons/TrashIcon.vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import NameXPreview from "~/components/games/namex/NameXPreview.vue";
import {watchOnce} from "@vueuse/shared";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import Checkmark from "~/components/icons/Checkmark.vue";
import {FlatAlbum, FlatArtist, FlatTrack, BaseTrack, RichArtist, RichAlbum, RichTrack} from "~/types/content";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NameXDef
const { data, pending, error } = await useAsyncData<NameXContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<NameXContainer[] | undefined>()
const editing = ref<NameXContainer | undefined>()
const input = ref("")
const editingIndex = ref<number>(-1)

function del(index: number) {
  editing.value!!.items.items.splice(index, 1)
}

function setType(editing: NameXContainer, type: "artist" | "album" | "track" | "text") {
  editing.items = { type: type, items: [] }
  input.value = ""
}

function addText() {
  if(editing.value?.items.type === "text") {
    editing.value?.items.items.push(input.value.trim())
    input.value = ""
  }
}

function addArtist(artist: RichArtist) {
  if(editing.value?.items.type === "artist") {
    editing.value?.items.items.push(FlatArtist.fromJson(artist.toFlatArtist()))
  }
}

function addAlbum(album: RichAlbum) {
  if(editing.value?.items.type === "album") {
    editing.value?.items.items.push(FlatAlbum.fromJson(album.toFlatAlbum()))
  }
}

function addTrack(track: RichTrack) {
  if(editing.value?.items.type === "track") {
    editing.value?.items.items.push(FlatTrack.fromJson(track.toFlatTrack()))
  }
}

watchOnce(data, () => instances.value = data.value)
watch(editing, (newVal, oldVal) => {
  if(!oldVal && newVal && Array.isArray(newVal.items)) {
    newVal.items = { type: "text", items: [] }
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

      <template #editBody v-if="editing && editing.items.items">
        <h2 class="font-bold opacity-80 mb-1">Input type</h2>
        <div class="flex gap-3 items-center mb-5">
          <button class="btn btn-primary" :class="{'btn-outline': editing.items.type !== 'artist'}" @click="setType(editing, 'artist')">Artists</button>
          <button class="btn btn-primary" :class="{'btn-outline': editing.items.type !== 'album'}" @click="setType(editing, 'album')">Albums</button>
          <button class="btn btn-primary" :class="{'btn-outline': editing.items.type !== 'track'}" @click="setType(editing, 'track')">Tracks</button>
          <button class="btn btn-primary" :class="{'btn-outline': editing.items.type !== 'text'}" @click="setType(editing, 'text')">Text</button>
        </div>

        <ul class="grid bg-base-100 rounded-box shadow-md divide-y divide-base-300 text-sm"
            :class="{ 'grid-cols-2': editing.items.items.length >= 10 }">
          <li
              v-for="(item, index) in editing.items.items"
              :key="index"
              class="relative flex items-center gap-3 py-2 px-3"
          >
            <div class="text-xl tabular-nums font-mono w-6 opacity-30">
              {{ index + 1 }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 font-semibold">
                <template v-if="item instanceof FlatTrack || item instanceof FlatAlbum">
                  {{ item.title }}
                </template>

                <template v-else-if="item instanceof FlatArtist">
                  {{ item.getDisplayName() }}
                </template>

                <template v-else>
                  <template v-if="editingIndex === index">
                    <input
                        v-model="editing.items.items[index]"
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

              <div class="text-xs opacity-60" v-if="item instanceof BaseTrack">
                {{ item.getArtistsString() }}
              </div>
            </div>

            <div class="absolute join flex flex-row justify-center items-center right-2 h-full">
              <template v-if="index === editingIndex">
                <button class="btn btn-success btn-xs join-item h-full" @click="editingIndex = -1"><Checkmark /></button>
              </template>
              <template v-else-if="editingIndex === -1">
                <button class="btn btn-primary btn-xs join-item" v-if="editing.items.type === 'text'" @click="editingIndex = index"><PencilIcon class="size-2" /></button>
                <button class="btn btn-error btn-xs join-item" @click="del(index)"><TrashIcon class="size-2" /></button>
              </template>
            </div>
          </li>
        </ul>

        <div class="mt-5">
          <template v-if="editing.items.type === 'track'">
            <TrackPicker :title="'Add'" @selected="addTrack" />
          </template>

          <template v-else-if="editing.items.type === 'album'">
            <TrackPicker :albums="true" :title="'Add'" @selected="a => addAlbum(a as RichAlbum)" />
          </template>

          <template v-else-if="editing.items.type === 'artist'">
            <ArtistPicker :title="'Add'" @selected="addArtist" />
          </template>

          <template v-else>
            <div class="join">
              <div>
                <label class="input join-item min-w-80">
                  <input type="text" maxlength="32" placeholder="Item..." v-model="input" @keyup.enter="addText()" required />
                </label>
              </div>
              <button class="btn btn-soft btn-primary join-item" @click="addText()">Add</button>
            </div>
          </template>
        </div>

        <div class="mt-5">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Number of items that must be guessed correctly</legend>
            <input class="input" type="number" v-model="editing!!.goal" min="1" :max="editing.items.items.length" placeholder="Guess goal" required />
          </fieldset>
        </div>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>