<script setup lang="ts">
import {ref} from "vue";
import {getDashboardArtists} from "~/utils/dashboard";
import {RichArtist} from "~/types/content";
import ArtistGrid from "~/components/dashboard/ArtistGrid.vue";

const { title, disabled, style } = defineProps({
  title: { type: String, default: "Select" },
  disabled: { type: Boolean, default: false },
  existing: { type: Array as PropType<string[]>, default: [] },
  style: { type: String, default: "" }
})
const emit = defineEmits(['selected'])
const modal = ref<HTMLDialogElement | null>();
const { data: allOptions, pending, error } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })

function select(track: RichArtist) {
  modal.value?.close()
  emit("selected", track)
}

</script>

<template>
  <template v-if="pending">
    <button class="btn btn-soft btn-primary" :class="[style]" disabled><span class="loading loading-dots loading-md"></span> Loading artist database</button>
  </template>
  <template v-else-if="error">
    <button class="btn btn-soft btn-error" :class="[style]" disabled>Failed to load artist database</button>
  </template>
  <template v-else-if="allOptions">
    <button class="btn btn-soft btn-primary" :class="[style]" :disabled="disabled" @click="modal?.showModal()">
      <slot>
        {{ title }} artist
      </slot>
    </button>

    <dialog id="trackPickerModal" ref="modal" class="modal">
      <div class="modal-box max-w-4/5 bg-base-300">
        <ArtistGrid :items="allOptions" :title="title" :existing="existing" @selected="select" />
      </div>
    </dialog>
  </template>
</template>

<style scoped>

</style>