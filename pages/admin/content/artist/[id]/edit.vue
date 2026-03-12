<script setup lang="ts">
import {RichArtist} from "~/types/content";
import {ref} from "vue";
import {getDashboardArtists, updateDashboardArtist} from "~/utils/dashboard";
import {useAsyncData} from "#app";
import ArtistEditor from "~/components/dashboard/content/ArtistEditor.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: artists, pending } = await useAsyncData("artist", () => getDashboardArtists(), { lazy: true })
const artist = computed<RichArtist | undefined>(() => artists.value?.find(a => a.id === id.value))

const editingModal = ref<HTMLDialogElement | undefined>(undefined)
const editingSaving = ref<boolean>(false)
const editingResponse = ref<boolean | undefined>(undefined)
const editingError = ref<string | undefined>()

async function edited(artist: RichArtist) {
  editingSaving.value = true
  editingResponse.value = undefined
  editingModal.value?.showModal()

  try {
    const fetched = await $fetch<RichArtist>("/api/dashboard/edit/artist", {
      method: "POST",
      body: artist
    }).then(RichArtist.fromJson)

    editingResponse.value = true
    updateDashboardArtist(fetched)
    navigateTo(`/admin/content/artist/${artist.id}`)
  } catch(e: any) {
    console.log("failed to edit ", artist, "error: ", e.message)
    editingError.value = e.message
  } finally {
    editingSaving.value = false
    editingModal.value?.close()
  }
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" />

  <ArtistEditor v-if="artist" :artist="deepCopyReactive(artist)" @edited="edited" />

  <dialog ref="editingModal" id="editingModal" class="modal">
    <div class="modal-box" v-if="editingResponse === undefined">
      <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Saving...</h3>
    </div>
  </dialog>
</template>

<style scoped>

</style>