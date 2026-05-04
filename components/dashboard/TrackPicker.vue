<script setup lang="ts">
import {ref} from "vue";
import {getDashboardAlbums, getDashboardTracks} from "~/utils/dashboard";
import TrackAlbumGrid from "~/components/dashboard/TrackAlbumGrid.vue";
import {RichAlbum, RichTrack} from "~/types/content";

const { albums, title, disabled, style, button } = defineProps({
  albums: { type: Boolean, default: false },
  title: { type: String, default: "Select" },
  disabled: { type: Boolean, default: false },
  existing: { type: Array as PropType<string[]>, default: [] },
  style: { type: String, default: "" },
  button: { type: Boolean, default: true },
})
const emit = defineEmits<{
  selected: [track: RichTrack | RichAlbum]
}>()
const mode = albums ? "album" : "track"
const modal = ref<HTMLDialogElement | null>();
const { data: allOptions, pending, error } = await useAsyncData(mode, () => (mode === "album" ? getDashboardAlbums(true) : getDashboardTracks(true)), { lazy: true })

function select(track: RichTrack) {
  modal.value?.close()
  emit("selected", track)
}

</script>

<template>
  <template v-if="pending">
    <template v-if="button">
      <button class="btn btn-soft btn-primary" :class="[style]" disabled><span class="loading loading-dots loading-md"></span> Loading {{ mode }} database</button>
    </template>
    <template v-else>
      <span class="loading loading-dots loading-md"></span> Loading {{ mode }} database
    </template>
  </template>
  <template v-else-if="error">
    <template v-if="button">
      <button class="btn btn-soft btn-error" :class="[style]" disabled>Failed to load {{ mode }} database</button>
    </template>
    <template v-else>
      Failed to load {{ mode }} database
    </template>
  </template>
  <template v-else-if="allOptions">
    <template v-if="button">
      <button class="btn btn-soft btn-primary" :class="[style]" :disabled="disabled" @click="modal?.showModal()">{{ title }} {{ mode }}</button>
    </template>
    <template v-else>
      <div @click="modal?.showModal()" :class="[style]">
        <slot>
          {{ title }} {{ mode }}
        </slot>
      </div>
    </template>

    <dialog id="trackPickerModal" ref="modal" class="modal">
      <div class="modal-box max-w-4/5 bg-base-300">
        <TrackAlbumGrid :items="allOptions" :albums="albums" :title="title" :existing="existing" @selected="select" />
      </div>
    </dialog>
  </template>
</template>

<style scoped>

</style>