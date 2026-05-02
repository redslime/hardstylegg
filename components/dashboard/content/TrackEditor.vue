<script setup lang="ts">
import {RichAlbum, RichArtist, RichTrack} from "~/types/content";
import Xmark from "~/components/icons/Xmark.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {isValidDate} from "~/utils/utils";

const { track, linkedAlbum } = defineProps({
  track: { type: Object as PropType<RichTrack>, required: true },
  linkedAlbum: { type: Object as PropType<RichAlbum> }
})
const emit = defineEmits<{
  edited: [track: RichTrack]
}>()
const validDate = ref<boolean>(true)
const errors = computed<string[]>(() => {
  const errors: string[] = []

  if(track.artists.length === 0) {
    errors.push("Track must have at least one artist")
  }
  if(track.title.length === 0) {
    errors.push("Track must have a title")
  }
  if(track.title.length > 128) {
    errors.push("Track title is too long")
  }
  if(!track.date || !validDate.value) {
    errors.push("Track must have a valid date")
  }

  return errors
})
const date = computed<string>({
  get() {
    return RichTrack.fromJson(track).getFriendlyDate()
  },
  set(value) {
    if(isValidDate(value)) {
      track.date = new Date(value)
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

  emit("edited", track)
}

function removeArtist(artist: RichArtist) {
  track.artists = track.artists.filter(a => a.id !== artist.id)
}

function addArtist(artist: RichArtist) {
  track.artists.push(artist)
}

</script>

<template>
  <div class="flex flex-col gap-2 bg-base-200 rounded-xl">
    <div class="bg-black/40 py-10 px-5 rounded-t-xl relative">
      <div class="flex gap-2 absolute bottom-5 right-5">
        <button class="btn btn-soft btn-lg" @click="navigateTo(`/admin/content/track/${track.sid}`)">
          Cancel
        </button>
        <button class="btn btn-success btn-soft btn-lg" :disabled="errors.length > 0" @click="save()">
          Save
        </button>
      </div>

      <div class="flex items-center gap-5">
        <img :src="`https://i.scdn.co/image/${track.image}`" class="size-80 rounded-xl"  alt="Track image"/>
        <div class="flex flex-col gap-2 w-full">
          <label class="badge badge-neutral badge-lg tooltip cursor-pointer"
               data-tip="Hidden tracks don't show up in user-facing input suggestions">
            <input type="checkbox" class="checkbox" v-model="track.hidden" />
            hidden
          </label>

          <div class="text-5xl font-bold">
            <input type="text" class="input input-xl w-4/5" v-model="track.title" maxlength="128" />
          </div>

          <span class="text-sm hover:underline hover:text-white cursor-pointer w-fit">
            <input type="date" class="input input-sm" v-model="date" />
          </span>

          <div class="text-xl text-base-content/80 flex flex-wrap gap-3">
            <template v-for="artist in track.artists" :key="artist.id">
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

    <div class="bg-info text-info-content text-xl p-5 rounded-b-xl" v-if="linkedAlbum">
      Part of album:
      <span class="hover:underline">
        <NuxtLink :to="`/admin/content/album/${linkedAlbum.sid}`">
        {{ linkedAlbum.title }}
      </NuxtLink>
      </span>
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