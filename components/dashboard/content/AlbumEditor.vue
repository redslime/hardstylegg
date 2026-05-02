<script setup lang="ts">
import {RichAlbum, RichArtist, RichTrack} from "~/types/content";
import Xmark from "~/components/icons/Xmark.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {isValidDate} from "~/utils/utils";

const { album } = defineProps({
  album: { type: Object as PropType<RichAlbum>, required: true }
})
const emit = defineEmits<{
  edited: [track: RichAlbum]
}>()
const validDate = ref<boolean>(true)
const errors = computed<string[]>(() => {
  const errors: string[] = []

  if(album.artists.length === 0) {
    errors.push("Album must have at least one artist")
  }
  if(album.title.length === 0) {
    errors.push("Album must have a title")
  }
  if(album.title.length > 128) {
    errors.push("Album title is too long")
  }
  if(!album.date || !validDate.value) {
    errors.push("Album must have a date")
  }

  return errors
})
const date = computed<string>({
  get() {
    return RichAlbum.fromJson(album).getFriendlyDate()
  },
  set(value) {
    if(isValidDate(value)) {
      album.date = new Date(value)
      validDate.value = true
    } else {
      validDate.value = false
    }
  }
})

function save() {
  if(errors.value.length > 0) {
    return
  }

  emit("edited", album)
}

function removeArtist(artist: RichArtist) {
  album.artists = album.artists.filter(a => a.id !== artist.id)
}

function addArtist(artist: RichArtist) {
  album.artists.push(artist)
}

</script>

<template>
  <div class="flex flex-col gap-2 bg-base-200 rounded-xl">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl relative">
      <div class="flex gap-2 absolute bottom-5 right-5">
        <button class="btn btn-soft btn-lg" @click="navigateTo(`/admin/content/album/${album.sid}`)">
          Cancel
        </button>
        <button class="btn btn-success btn-soft btn-lg" :disabled="errors.length > 0" @click="save()">
          Save
        </button>
      </div>

      <div class="flex items-center gap-5">
        <img :src="`https://i.scdn.co/image/${album.image}`" class="size-80 rounded-xl"  alt="Track image"/>
        <div class="flex flex-col gap-2 w-full">
          <label class="badge badge-neutral badge-lg tooltip cursor-pointer"
               data-tip="Hidden tracks don't show up in user-facing input suggestions">
            <input type="checkbox" class="checkbox" v-model="album.hidden" />
            hidden
          </label>

          <div class="text-5xl font-bold">
            <input type="text" class="input input-xl w-4/5" v-model="album.title" maxlength="128" />
          </div>

          <span class="text-sm hover:underline hover:text-white cursor-pointer w-fit">
            <input type="date" class="input input-sm" v-model="date" />
          </span>

          <div class="text-xl text-base-content/80 flex flex-wrap gap-3">
            <template v-for="artist in album.artists" :key="artist.id">
              <div class="w-fit bg-primary/20 p-1 rounded-full pr-3">
                <div class="flex gap-2 items-center">
                  <img :src="`https://i.scdn.co/image/${artist.image}`" class="size-10 rounded-full"  alt="Artist image" v-if="artist.image" />
                  <p class="text-primary/90 leading-10">{{ artist.name }}</p>
                  <Xmark class="cursor-pointer transition-colors hover:text-white" @click="removeArtist(artist)" />
                </div>
              </div>
            </template>

            <ArtistPicker :title="'Add'" :style="'hover:btn-primary rounded-full btn-lg flex gap-2 items-center'" @selected="addArtist">
              <PlusIcon />
              Add
            </ArtistPicker>
          </div>
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
  </div>
</template>

<style scoped>

</style>