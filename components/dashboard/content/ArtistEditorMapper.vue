<script setup lang="ts">
import {RichArtist} from "~/types/content";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import ArrowRightIcon from "~/components/icons/ArrowRightIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import RemapIcon from "~/components/icons/RemapIcon.vue";

const props = defineProps({
  artist: { type: Object as PropType<RichArtist>, required: true }
})
const emit = defineEmits<{
  mappedTo: [artist: RichArtist]
}>()

const artist = computed<RichArtist>(() => RichArtist.fromJson(props.artist))
const modal = ref<HTMLDialogElement | null>()
const isSaving = ref<boolean>(false)
const target = ref<RichArtist | null>(null)
const error = ref<string | null>(null)

function select(selected: RichArtist) {
  target.value = selected
}

async function remap() {
  if(target.value) {
    isSaving.value = true

    try {
      const fetched = await $fetch<RichArtist>("/api/dashboard/edit/artist/remap", {
        method: "POST",
        body: { from: artist.value, to: target.value }
      })

      window.location.href = `/admin/content/artist/${fetched.id}` // hard refreshes
    } catch (e: any) {
      console.log("failed to remap artist", artist.value, "to", target.value, e)
      error.value = e.message
    }
  }
}

function closed() {
  target.value = null
  isSaving.value = false
  error.value = null
}
</script>

<template>
  <button class="btn btn-soft btn-primary" @click="modal?.showModal()">
    <RemapIcon />
    Remap to...
  </button>

  <dialog ref="modal" id="modal" class="modal" @close="closed()">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>

      <div class="flex flex-col gap-2 text-center items-center mb-10">
        <h3 class="text-2xl font-bold">Remap artist to another artist</h3>
        <p>This will <b>relink all tracks</b> of the current artist onto the selected artist and then <b>delete the old artist.</b></p>
      </div>

      <div class="flex gap-5 h-full justify-around border border-neutral/50 rounded-md bg-base-200" v-if="!error">
        <div class="p-4 text-center">
          <h2 class="mb-4 font-bold">From:</h2>
          <ArtistCard :artist="artist" :clickable="false" />
        </div>

        <div class="content-center">
          <ArrowRightIcon class="size-10" />
        </div>

        <div class="p-4 text-center">
          <h2 class="mb-4 font-bold">To:</h2>
          <ArtistPicker :title="'Select'" @selected="select" v-if="!target" />

          <div class="relative group" v-else>
            <ArtistCard :artist="target" :clickable="false" />

            <div class="absolute z-1000 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-sm btn-outline btn-error" @click="target = null">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-error alert-soft" v-if="error">
        {{ error }}
      </div>

      <div class="text-center mt-5">
        <button class="btn btn-success btn-soft btn-lg" :disabled="!target || isSaving" @click="remap()" v-if="!error">
          <template v-if="!isSaving">
            Remap
          </template>
          <template v-else>
            <span class="loading loading-spinner loading-md"></span>
          </template>
        </button>

        <button class="btn btn-soft btn-lg" @click="modal?.close()" v-else>
          Close
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>