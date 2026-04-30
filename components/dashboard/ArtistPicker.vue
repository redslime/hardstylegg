<script setup lang="ts">
import {ref} from "vue";
import {getDashboardArtists} from "~/utils/dashboard";
import {RichArtist} from "~/types/content";
import ArtistGrid from "~/components/dashboard/ArtistGrid.vue";

const { title, disabled, style, button } = defineProps({
  title: { type: String, default: "Select" },
  disabled: { type: Boolean, default: false },
  existing: { type: Array as PropType<string[]>, default: [] },
  style: { type: String, default: "" },
  button: { type: Boolean, default: true },
})
const emit = defineEmits<{
  selected: [artist: RichArtist]
}>()
const modal = ref<HTMLDialogElement | null>();
const { data: allOptions, pending, error } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })

function select(track: RichArtist) {
  modal.value?.close()
  emit("selected", track)
}

</script>

<template>
  <template v-if="pending">
    <template v-if="button">
      <button class="btn btn-soft btn-primary" :class="[style]" disabled><span class="loading loading-dots loading-md"></span> Loading artist database</button>
    </template>
    <template v-else>
      <span class="loading loading-dots loading-md"></span> Loading artist database
    </template>
  </template>
  <template v-else-if="error">
    <template v-if="button">
      <button class="btn btn-soft btn-error" :class="[style]" disabled>Failed to load artist database</button>
    </template>
    <template v-else>
      Failed to load artist database
    </template>
  </template>
  <template v-else-if="allOptions">
    <template v-if="button">
      <button class="btn btn-soft btn-primary" :class="[style]" :disabled="disabled" @click="modal?.showModal()">
        <slot>
          {{ title }} artist
        </slot>
      </button>
    </template>
    <template v-else>
      <div @click="modal?.showModal()" :class="[style]">
        <slot>
          {{ title }} artist
        </slot>
      </div>
    </template>

    <dialog id="artistPickerModal" ref="modal" class="modal">
      <div class="modal-box absolute max-w-4/5 bg-base-300">
        <ArtistGrid :items="allOptions" :title="title" :existing="existing" @selected="select" />
      </div>
    </dialog>
  </template>
</template>

<style scoped>

</style>