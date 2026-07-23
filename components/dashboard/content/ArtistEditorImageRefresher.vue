<script setup lang="ts">
import {RichArtist} from "~/types/content";
import ArrowPathIcon from "~/components/icons/ArrowPathIcon.vue";

const { artist } = defineProps({
  artist: { type: Object as PropType<RichArtist>, required: true }
})
const emit = defineEmits<{
  updatedImage: [image: string | null]
}>()

const refreshing = ref<boolean>(false)
const error = ref<string | null>(null)
const done = ref<boolean>(false)

async function refresh() {
  if(refreshing.value || error.value) return

  try {
    refreshing.value = true

    const fetched = await $fetch<RichArtist>('/api/dashboard/import/fetchArtistImage?artistId=' + artist.id).then(RichArtist.fromJson)
    emit('updatedImage', fetched.image)

    done.value = true
  } catch (e: any) {
    console.error(e)
    error.value = e.message
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <button class="btn btn-soft btn-primary" :disabled="refreshing || done" @click="refresh()" v-if="!error">
    <ArrowPathIcon class="size-4" :class="{'animate-spin': refreshing}" />
    Refresh image
  </button>

  <button class="btn btn-soft btn-error" disabled @click="error = null" v-else>
    Error:
    <span class="text-error">{{ error }}</span>
  </button>
</template>

<style scoped>

</style>