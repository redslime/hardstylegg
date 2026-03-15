<script setup lang="ts">
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import type {RichArtist} from "~/types/content";
import {updateDashboardArtist} from "~/utils/dashboard";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const artistRegex = /https:\/\/open.spotify.com\/artist\/([A-z0-9]{22})/
const url = ref<string | undefined>()
const validUrl = computed<boolean>(() => artistRegex.test(url.value ?? ""))
const importing = ref(false)

async function start() {
  if(!validUrl.value) return

  const id = artistRegex.exec(url.value!!)?.[1]

  if(id) {
    importing.value = true
    try {
      await $fetch<RichArtist>("/api/dashboard/import/fetchArtist?artistId=" + id).then(artist => {
        updateDashboardArtist(artist)
        navigateTo("/admin/radar-inbox")
      })
    } catch (e: any) {
      alert(e.message)
    }
    importing.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CloudArrowDownIcon class="size-8" /></span>
    Import artist
  </div>

  <div role="alert" class="alert alert-info alert-soft">
    <span>After fetching all tracks and albums from Spotify, you will be redirected to the Inbox to do editing there.</span>
  </div>

  <fieldset class="fieldset">
    <legend class="fieldset-legend">Insert artist url</legend>
    <div class="join">
      <div>
        <label class="input join-item w-96"
          :class="{'border border-error': !validUrl}">
          <input class="w-full" type="url" required :disabled="importing" v-model="url" />
        </label>
        <div class="text-error" v-if="!validUrl">Enter valid artist url</div>
      </div>
      <button class="btn btn-success btn-soft join-item" :disabled="!validUrl" v-if="!importing" @click="start()">Import</button>
      <button class="btn btn-success btn-soft join-item" disabled v-else><span class="loading loading-spinner"></span></button>
    </div>
  </fieldset>
</template>

<style scoped>

</style>