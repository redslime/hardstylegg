<script setup lang="ts">
import {RichArtist} from "~/types/content";
import ArtistEditorMapper from "~/components/dashboard/content/ArtistEditorMapper.vue";
import ArtistEditorSplitter from "~/components/dashboard/content/ArtistEditorSplitter.vue";

const { artist } = defineProps({
  artist: { type: Object as PropType<RichArtist>, required: true }
})
const emit = defineEmits<{
  edited: [track: RichArtist]
}>()
const errors = computed<string[]>(() => {
  const errors: string[] = []

  if(artist.name.length === 0) {
    errors.push("Artist must have a name")
  }
  if(artist.name.length > 128) {
    errors.push("Artist name is too long")
  }

  return errors
})

function save() {
  if(errors.value.length > 0) {
    return
  }

  emit("edited", artist)
}

</script>

<template>
  <div class="flex flex-col gap-2 bg-base-200 rounded-xl">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl relative">
      <div class="flex gap-2 absolute bottom-5 right-5">
        <button class="btn btn-soft btn-lg" @click="navigateTo(`/admin/content/artist/${artist.id}`)">
          Cancel
        </button>
        <button class="btn btn-success btn-soft btn-lg" :disabled="errors.length > 0" @click="save()">
          Save
        </button>
      </div>

      <div class="flex items-center gap-5">
        <img :src="`https://i.scdn.co/image/${artist.image}`" class="size-30 rounded-full object-cover" alt="Artist image" v-if="artist.image" />
        <div class="text-5xl font-bold w-full">
          <input type="text" class="input input-xl w-1/2" v-model="artist.name" maxlength="128" />
        </div>
      </div>
    </div>

    <div class="bg-warning text-warning-content p-5 rounded-b-xl" v-if="errors.length > 0">
      <ul>
        <li v-for="error in errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="bg-black/40 rounded-b-xl -mt-2 h-3" v-else></div>
  </div>

  <div class="mt-5 flex gap-3">
    <ArtistEditorMapper :artist="artist" />
    <ArtistEditorSplitter :artist="artist" />
  </div>
</template>

<style scoped>

</style>