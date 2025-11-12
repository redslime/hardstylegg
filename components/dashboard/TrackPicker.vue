<script setup lang="ts">
import type {Track} from "~/types/models";
import {ref} from "vue";
import {getDashboardAlbums, getDashboardTracks} from "~/utils/dashboard";
import TrackAlbumGrid from "~/components/dashboard/TrackAlbumGrid.vue";

const { albums, title, disabled } = defineProps({
  albums: { type: Boolean, default: false },
  title: { type: String, default: "Select" },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['selected'])
const mode = albums ? "album" : "track"
const modal = ref<HTMLDialogElement | null>();
const { data: allOptions, pending, error } = await useAsyncData(mode, () => (mode === "album" ? getDashboardAlbums() : getDashboardTracks()), { lazy: true })

function select(track: Track) {
  modal.value?.close()
  emit("selected", track)
}

</script>

<template>
  <template v-if="pending">
    <button class="btn btn-soft btn-primary" disabled><span class="loading loading-dots loading-md"></span> Loading {{ mode }} database</button>
  </template>
  <template v-else-if="error">
    <button class="btn btn-soft btn-error" disabled>Failed to load {{ mode }} database</button>
  </template>
  <template v-else-if="allOptions">
    <button class="btn btn-soft btn-primary" :disabled="disabled" @click="modal?.showModal()">{{ title }} {{ mode }}</button>

    <dialog id="trackPickerModal" ref="modal" class="modal">
      <div class="modal-box max-w-4/5 bg-base-300">
        <TrackAlbumGrid :items="allOptions" :albums="albums" :title="title" @selected="select" />
      </div>
    </dialog>
  </template>
</template>

<style scoped>

</style>