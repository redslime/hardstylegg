<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, getDashboardTracks, updateDashboardTrack} from "~/utils/dashboard";
import {type RichAlbum, RichTrack} from "~/types/content";
import TrackEditor from "~/components/dashboard/content/TrackEditor.vue";
import {ref} from "vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: tracks, pending } = await useAsyncData("track", () => getDashboardTracks(), { lazy: true })
const { data: albums } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const track = computed<RichTrack | undefined>(() => tracks.value?.find(a => a.sid === id.value))
const linkedAlbum = computed<RichAlbum | undefined>(() => albums.value?.find(a => a.tracks.map(t => t.sid).includes(id.value)))

const editingModal = ref<HTMLDialogElement | undefined>(undefined)
const editingSaving = ref<boolean>(false)
const editingResponse = ref<boolean | undefined>(undefined)
const editingError = ref<string | undefined>()

async function edited(track: RichTrack) {
  editingSaving.value = true
  editingResponse.value = undefined
  editingModal.value?.showModal()

  try {
    const fetched = await $fetch<RichTrack>("/api/dashboard/edit/track", {
      method: "POST",
      body: track
    }).then(RichTrack.fromJson)

    editingResponse.value = true
    updateDashboardTrack(fetched)
    navigateTo(`/admin/content/track/${track.sid}`)
  } catch(e: any) {
    console.log("failed to edit ", track, "error: ", e.message)
    editingError.value = e.message
  } finally {
    editingSaving.value = false
    editingModal.value?.close()
  }
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" />

  <TrackEditor v-if="track" :track="deepCopyReactive(track)" :linkedAlbum="linkedAlbum" @edited="edited" />

  <dialog ref="editingModal" id="editingModal" class="modal">
    <div class="modal-box" v-if="editingResponse === undefined">
      <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Saving...</h3>
    </div>
  </dialog>
</template>

<style scoped>

</style>