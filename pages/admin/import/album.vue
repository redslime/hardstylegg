<script setup lang="ts">
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import {RichAlbum} from "~/types/content";
import {updateDashboardAlbum} from "~/utils/dashboard";

definePageMeta({
  middleware: ['authenticated-admin'],
})

const compRegex = /https:\/\/open.spotify.com\/album\/([A-z0-9]{22})/
const url = ref<string | undefined>()
const validUrl = computed<boolean>(() => compRegex.test(url.value ?? ""))
const importing = ref(false)

async function start() {
  if (!validUrl.value) return

  const id = compRegex.exec(url.value!!)?.[1]

  if (id) {
    importing.value = true
    const album = await $fetch<RichAlbum>("/api/dashboard/import/fetchAlbum?albumId=" + id).then(RichAlbum.fromJson)
    updateDashboardAlbum(album)
    navigateTo(`/admin/content/album/${album.sid}`)
    importing.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CloudArrowDownIcon class="size-8" /></span>
    Import album
  </div>

  <fieldset class="fieldset">
    <legend class="fieldset-legend">Insert album url</legend>
    <div class="join">
      <div>
        <label class="input join-item w-96"
               :class="{'border border-error': !validUrl}">
          <input class="w-full" type="url" required :disabled="importing" v-model="url" />
        </label>
        <div class="text-error" v-if="!validUrl">Enter valid album url</div>
      </div>
      <button class="btn btn-success btn-soft join-item" :disabled="!validUrl" v-if="!importing" @click="start()">Import</button>
      <button class="btn btn-success btn-soft join-item" disabled v-else><span class="loading loading-spinner"></span></button>
    </div>
  </fieldset>
</template>

<style scoped>

</style>