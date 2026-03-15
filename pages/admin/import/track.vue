<script setup lang="ts">
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import {RichTrack} from "~/types/content";
import {updateDashboardTrack} from "~/utils/dashboard";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const trackRegex = /https:\/\/open.spotify.com\/track\/([A-z0-9]{22})/
const url = ref<string | undefined>()
const validUrl = computed<boolean>(() => trackRegex.test(url.value ?? ""))
const importing = ref(false)

async function start() {
  if (!validUrl.value) return

  const id = trackRegex.exec(url.value!!)?.[1]

  if (id) {
    importing.value = true
    const track = await $fetch<RichTrack>("/api/dashboard/import/fetchTrack?trackId=" + id).then(RichTrack.fromJson)
    updateDashboardTrack(track)
    navigateTo(`/admin/content/track/${track.sid}`)
    importing.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CloudArrowDownIcon class="size-8" /></span>
    Import track
  </div>

  <fieldset class="fieldset">
    <legend class="fieldset-legend">Insert track url</legend>
    <div class="join">
      <div>
        <label class="input join-item w-96"
               :class="{'border border-error': !validUrl}">
          <input class="w-full" type="url" required :disabled="importing" v-model="url" />
        </label>
        <div class="text-error" v-if="!validUrl">Enter valid track url</div>
      </div>
      <button class="btn btn-success btn-soft join-item" :disabled="!validUrl" v-if="!importing" @click="start()">Import</button>
      <button class="btn btn-success btn-soft join-item" disabled v-else><span class="loading loading-spinner"></span></button>
    </div>
  </fieldset>
</template>

<style scoped>

</style>