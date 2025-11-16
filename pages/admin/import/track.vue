<script setup lang="ts">
import type {Track} from "~/types/models";
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import Checkmark from "~/components/icons/Checkmark.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const trackRegex = /https:\/\/open.spotify.com\/track\/([A-z0-9]{22})/
const url = ref<string | undefined>()
const validUrl = computed<boolean>(() => trackRegex.test(url.value ?? ""))
const importing = ref(false)
const data = ref<Track>()
const editing = ref<Track | null>(null)

async function start() {
  if(!validUrl.value) return

  const id = trackRegex.exec(url.value!!)?.[1]

  if(id) {
    importing.value = true
    data.value = await $fetch<Track>("/api/dashboard/import/fetchTrack?trackId=" + id)
    importing.value = false
  }
}

function edit(item: Track) {
  editing.value = item
}

async function finish() {
  if(!data.value) return
  importing.value = true

  try {
    const success = await $fetch<boolean>("/api/dashboard/import/track", {
      method: "POST",
      body: data!!.value
    })

    if(success) {
      importing.value = false
      editing.value = null
      url.value = undefined
      data.value = undefined
    } else {
      alert("Failed to import track")
    }
  } catch(e: any) {
    alert("Failed to import track")
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CloudArrowDownIcon class="size-8" /></span>
    Import track
  </div>

  <fieldset class="fieldset" v-if="!data">
    <legend class="fieldset-legend">Insert track url</legend>
    <div class="join">
      <div>
        <label class="input join-item w-96"
               :class="{'border-1 border-error': !validUrl}">
          <input class="w-full" type="url" required :disabled="importing" v-model="url" />
        </label>
        <div class="text-error" v-if="!validUrl">Enter valid track url</div>
      </div>
      <button class="btn btn-success btn-soft join-item" :disabled="!validUrl" v-if="!importing" @click="start()">Import</button>
      <button class="btn btn-success btn-soft join-item" disabled v-else><span class="loading loading-spinner"></span></button>
    </div>
  </fieldset>

  <template v-if="data">
    <pre>{{ data }}</pre>

    <div
        class="bg-base-200 rounded-lg shadow p-2 flex flex-col justify-start my-8"
        :class="{'max-w-[195px]': editing?.sid !== data.sid,
                    'w-90': editing?.sid === data.sid}"
    >
      <div class="relative group">
        <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${data.cover_art}`" alt="Cover art" />
        <div v-if="!editing" class="absolute z-10 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button class="btn btn-sm btn-outline btn-primary" @click="edit(data)">Edit</button>
        </div>
      </div>
      <template v-if="editing && editing.sid === data.sid">
        <input class="input input-sm text-lg font-semibold" v-model="editing.title" />
        <input class="input input-xs text-sm opacity-70" v-model="editing.artists" />
        <input class="input input-xs text-xs opacity-70" type="number" v-model="editing.year" />
        <button class="btn btn-success mt-1 btn-xs btn-soft" @click="editing = null"><Checkmark />Save</button>
      </template>
      <template v-else>
        <div class="text-lg font-semibold">{{ data.title }}</div>
        <div class="text-sm opacity-70">{{ data.artists }}</div>
        <div class="text-xs opacity-70">{{ data.year }}</div>
      </template>
    </div>

    <button class="btn btn-success btn-soft btn-lg" @click="finish()" v-if="!importing">Finish import</button>
    <button class="btn btn-success btn-soft btn-lg" disabled v-if="importing"><span class="loading loading-spinner"></span>Finishing... (can take a while)</button>
  </template>
</template>

<style scoped>

</style>