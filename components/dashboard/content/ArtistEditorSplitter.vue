<script setup lang="ts">
import {RichArtist} from "~/types/content";
import ArrowRightIcon from "~/components/icons/ArrowRightIcon.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";

const props = defineProps({
  artist: { type: RichArtist, required: true }
})
const emit = defineEmits<{
  mappedTo: [artist: RichArtist]
}>()

const artist = computed<RichArtist>(() => RichArtist.fromJson(props.artist))
const modal = ref<HTMLDialogElement | null>()
const isSaving = ref<boolean>(false)
const target1 = ref<RichArtist | null>(null)
const target2 = ref<RichArtist | null>(null)
const error = ref<string | null>(null)

async function split() {
  if(target1.value && target2.value) {
    isSaving.value = true

    try {
      const fetched = await $fetch<RichArtist[]>("/api/dashboard/edit/artist/split", {
        method: "POST",
        body: { from: artist.value, to1: target1.value, to2: target2.value }
      })

      window.location.href = `/admin/content/artist/${fetched[0]?.id}` // hard refreshes
    } catch (e: any) {
      console.log("failed to split artist", artist.value, "to", target1.value, "and", target2.value, e)
      error.value = e.message
    }
  }
}

function closed() {
  target1.value = null
  target2.value = null
  isSaving.value = false
  error.value = null
}
</script>

<template>
  <button class="btn btn-soft btn-primary" @click="modal?.showModal()">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
    Split into...
  </button>

  <dialog ref="modal" id="modal" class="modal" @close="closed()">
    <div class="modal-box max-w-2xl w-full">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>

      <div class="flex flex-col gap-2 text-center items-center mb-10">
        <h3 class="text-2xl font-bold">Split artist to other artists</h3>
        <p>This will <b>relink all tracks</b> of the current artist onto the selected artists and then <b>delete the old artist.</b></p>
      </div>

      <div class="flex gap-2 h-full items-center justify-center border border-neutral/50 rounded-md bg-base-200" v-if="!error">
        <div class="p-4 text-center">
          <h2 class="mb-4 font-bold">From:</h2>
          <ArtistCard :artist="artist" :clickable="false" />
        </div>

        <div class="content-center">
          <ArrowRightIcon class="size-10" />
        </div>

        <div class="p-4 text-center">
          <h2 class="mb-4 font-bold">To:</h2>
          <ArtistPicker :title="'Select'" @selected="a => target1 = a" v-if="!target1" />

          <div class="relative group" v-else>
            <ArtistCard :artist="target1" :clickable="false" />

            <div class="absolute z-1000 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-sm btn-outline btn-error" @click="target1 = null">Remove</button>
            </div>
          </div>
        </div>

        <div class="content-center -mx-3">
          <PlusIcon class="size-10" />
        </div>

        <div class="p-4 text-center">
          <h2 class="mb-4 font-bold">To:</h2>
          <ArtistPicker :title="'Select'" @selected="a => target2 = a" v-if="!target2" />

          <div class="relative group" v-else>
            <ArtistCard :artist="target2" :clickable="false" />

            <div class="absolute z-1000 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-sm btn-outline btn-error" @click="target2 = null">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-error alert-soft" v-if="error">
        {{ error }}
      </div>

      <div class="text-center mt-5">
        <button class="btn btn-success btn-soft btn-lg" :disabled="!target1 || !target2 || isSaving" @click="split()" v-if="!error">
          <template v-if="!isSaving">
            Split
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