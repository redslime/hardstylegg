<script setup lang="ts">
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import type {Track} from "~/types/models";
import Checkmark from "~/components/icons/Checkmark.vue";
import {findDuplicates} from "~/utils/duplicates";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const artistRegex = /https:\/\/open.spotify.com\/artist\/([A-z0-9]{22})/
const url = ref<string | undefined>()
const validUrl = computed<boolean>(() => artistRegex.test(url.value ?? ""))
const importing = ref(false)
const data = ref<{ albums: Track[], tracks: Track[] }>()
const editing = ref<Track | null>(null)
const duplicates = ref<Record<string, Track[]>>(findDuplicates(data.value?.tracks ?? []))

async function start() {
  if(!validUrl.value) return

  const id = artistRegex.exec(url.value!!)?.[1]

  if(id) {
    importing.value = true
    data.value = await $fetch<{ albums: Track[], tracks: Track[] }>("/api/dashboard/import/fetchArtist?artistId=" + id)
    importing.value = false
  }
}

async function finish() {
  if(!data.value) return
  importing.value = true

  try {
    const success = await $fetch<boolean>("/api/dashboard/import/artist", {
      method: "POST",
      body: { albums: data.value!!.albums, tracks: data.value!!.tracks }
    })

    if(success) {
      importing.value = false
      editing.value = null
      url.value = undefined
      data.value = undefined
    } else {
      alert("Failed to import artist")
    }
  } catch(e: any) {
    alert("Failed to import artist")
  }
}

function edit(item: Track) {
  editing.value = item
}

function remove(item: Track) {
  const albumIndex = data.value!!.albums.findIndex(a => a.sid === item.sid)
  const trackIndex = data.value!!.tracks.findIndex(t => t.sid === item.sid)

  if(albumIndex !== -1) data.value!!.albums.splice(albumIndex, 1)
  if(trackIndex !== -1) data.value!!.tracks.splice(trackIndex, 1)
}

watchEffect(() => {
  if(editing && editing.value) return
  duplicates.value = findDuplicates(data.value?.tracks ?? [])
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CloudArrowDownIcon class="size-8" /></span>
    Import artist
  </div>

  <fieldset class="fieldset" v-if="!data">
    <legend class="fieldset-legend">Insert artist url</legend>
    <div class="join">
      <div>
        <label class="input join-item w-96"
          :class="{'border-1 border-error': !validUrl}">
          <input class="w-full" type="url" required :disabled="importing" v-model="url" />
        </label>
        <div class="text-error" v-if="!validUrl">Enter valid artist url</div>
      </div>
      <button class="btn btn-success btn-soft join-item" :disabled="!validUrl" v-if="!importing" @click="start()">Import</button>
      <button class="btn btn-success btn-soft join-item" disabled v-else><span class="loading loading-spinner"></span></button>
    </div>
  </fieldset>

  <template v-if="data">
    <div role="alert" class="alert alert-warning mb-10 w-fit font-medium">
      You can edit or remove any item before finalizing the import by hovering over the artwork.
      <br>
      Scroll down to continue!
    </div>

    <div class="mb-8" v-if="data.albums && data.albums.length > 0">
      <h2 class="text-3xl font-bold bg-primary text-primary-content p-2 my-3">Albums ({{ data.albums.length }})</h2>

      <div class="flex flex-wrap gap-3">
        <div
            class="h-full bg-base-200 rounded-lg shadow p-2 flex flex-col justify-start"
            :class="{'max-w-[195px]': editing?.sid !== item.sid,
                    'w-90': editing?.sid === item.sid}"
            v-for="item in data.albums"
            :key="item.sid"
        >
          <div class="relative group">
            <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.cover_art}`" alt="Cover art" />
            <div v-if="!editing" class="absolute z-10 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-sm btn-outline btn-primary" @click="edit(item)">Edit</button>
              <button class="btn btn-sm btn-outline btn-error" @click="remove(item)">Remove</button>
            </div>
          </div>
          <template v-if="editing && editing.sid === item.sid">
            <input class="input input-sm text-lg font-semibold" v-model="editing.title" />
            <input class="input input-xs text-sm opacity-70" v-model="editing.artists" />
            <input class="input input-xs text-xs opacity-70" type="number" v-model="editing.year" />
            <button class="btn btn-success mt-1 btn-xs btn-soft" @click="editing = null"><Checkmark />Save</button>
          </template>
          <template v-else>
            <div class="text-lg font-semibold">{{ item.title }}</div>
            <div class="text-sm opacity-70">{{ item.artists }}</div>
            <div class="text-xs opacity-70">{{ item.year }}</div>
          </template>
        </div>
      </div>
    </div>

    <div class="mb-8" v-if="data.tracks && data.tracks.length > 0">
      <h2 class="text-3xl font-bold bg-primary text-primary-content p-2 my-3">Tracks ({{ data.tracks.length }})</h2>

      <div class="flex flex-wrap gap-3">
        <div
            class="h-full bg-base-200 rounded-lg shadow p-2 flex flex-col justify-start"
            :class="{'max-w-[195px]': editing?.sid !== item.sid,
                    'w-90': editing?.sid === item.sid}"
            v-for="item in data.tracks"
            :key="item.sid"
        >
          <div class="relative group">
            <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.cover_art}`" alt="Cover art" />
            <div v-if="!editing" class="absolute z-10 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-sm btn-outline btn-primary" @click="edit(item)">Edit</button>
              <button class="btn btn-sm btn-outline btn-error" @click="remove(item)">Remove</button>
            </div>
          </div>
          <template v-if="editing && editing.sid === item.sid">
            <input class="input input-sm text-lg font-semibold" v-model="editing.title" />
            <input class="input input-xs text-sm opacity-70" v-model="editing.artists" />
            <input class="input input-xs text-xs opacity-70" type="number" v-model="editing.year" />
            <button class="btn btn-success mt-1 btn-xs btn-soft" @click="editing = null"><Checkmark />Save</button>
          </template>
          <template v-else>
            <div class="text-lg font-semibold">{{ item.title }}</div>
            <div class="text-sm opacity-70">{{ item.artists }}</div>
            <div class="text-xs opacity-70">{{ item.year }}</div>
          </template>
        </div>
      </div>
    </div>

    <div class="mb-8" v-if="duplicates && Object.keys(duplicates).length > 0">
      <h2 class="text-3xl font-bold bg-primary text-primary-content p-2 my-3">Duplicate Tracks ({{ Object.keys(duplicates).length }})</h2>

      <div role="alert" class="alert alert-warning mb-10 w-fit font-medium">
        Check these potential duplicates and resolve them if needed.
        <br>
        Having two versions of the same track (radio edit and original mix) should be avoided.
        <br>
        In such a case, remove the original mix and keep the radio edit. You can also edit the "radio edit" out of the title.
      </div>

      <div class="flex flex-wrap gap-4 justify-center">
        <div class="my-3" v-for="([key, value], index) of Object.entries(duplicates)" :key="index">
          <div class="text-xl font-bold bg-secondary text-secondary-content p-2 mb-4">
            {{ key }}
          </div>

          <div class="flex flex-wrap gap-3">
            <div
                class="h-full bg-base-200 rounded-lg shadow p-2 flex flex-col justify-start"
                :class="{'max-w-[195px]': editing?.sid !== item.sid,
                    'w-90': editing?.sid === item.sid}"
                v-for="item in value"
                :key="index"
            >
              <div class="relative group">
                <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.cover_art}`" alt="Cover art" />
                <div v-if="!editing" class="absolute z-10 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button class="btn btn-sm btn-outline btn-primary" @click="edit(item)">Edit</button>
                  <button class="btn btn-sm btn-outline btn-error" @click="remove(item)">Remove</button>
                </div>
              </div>
              <template v-if="editing && editing.sid === item.sid">
                <input class="input input-sm text-lg font-semibold" v-model="editing.title" />
                <input class="input input-xs text-sm opacity-70" v-model="editing.artists" />
                <input class="input input-xs text-xs opacity-70" type="number" v-model="editing.year" />
                <button class="btn btn-success mt-1 btn-xs btn-soft" @click="editing = null"><Checkmark />Save</button>
              </template>
              <template v-else>
                <div class="text-lg font-semibold">{{ item.title }}</div>
                <div class="text-sm opacity-70">{{ item.artists }}</div>
                <div class="text-xs opacity-70">{{ item.year }}</div>
                <div class="text-xs opacity-70 font-mono text-base-content/50">{{ item.sid }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-success btn-soft btn-lg" @click="finish()" v-if="!importing">Finish import</button>
    <button class="btn btn-success btn-soft btn-lg" disabled v-if="importing"><span class="loading loading-spinner"></span>Finishing... (can take a while)</button>
  </template>
</template>

<style scoped>

</style>