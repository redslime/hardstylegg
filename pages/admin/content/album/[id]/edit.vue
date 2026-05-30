<script setup lang="ts">
import {useAsyncData} from "#app";
import {getDashboardAlbums, updateDashboardAlbum} from "~/utils/dashboard";
import {RichAlbum} from "~/types/content";
import {ref} from "vue";
import AlbumEditor from "~/components/dashboard/content/AlbumEditor.vue";

definePageMeta({
  middleware: ['authenticated-admin'],
})

const route = useRoute()
const id = computed<string>(() => route.params.id as string)
const { data: albums, pending } = await useAsyncData("album", () => getDashboardAlbums(), { lazy: true })
const album = computed<RichAlbum | undefined>(() => albums.value?.find(a => a.sid === id.value))

const editingModal = ref<HTMLDialogElement | undefined>(undefined)
const editingSaving = ref<boolean>(false)
const editingResponse = ref<boolean | undefined>(undefined)
const editingError = ref<string | undefined>()

async function edited(album: RichAlbum) {
  editingSaving.value = true
  editingResponse.value = undefined
  editingModal.value?.showModal()

  try {
    const fetched = await $fetch<RichAlbum>("/api/dashboard/edit/album", {
      method: "POST",
      body: album
    }).then(RichAlbum.fromJson)

    editingResponse.value = true
    updateDashboardAlbum(fetched)
    navigateTo(`/admin/content/album/${album.sid}`)
  } catch(e: any) {
    console.log("failed to edit ", album, "error: ", e.message)
    editingError.value = e.message
  } finally {
    editingSaving.value = false
    editingModal.value?.close()
  }
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" />

  <AlbumEditor v-if="album" :album="deepCopyReactive(album)" @edited="edited" />

  <dialog ref="editingModal" id="editingModal" class="modal">
    <div class="modal-box" v-if="editingResponse === undefined">
      <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Saving...</h3>
    </div>
  </dialog>
</template>

<style scoped>

</style>