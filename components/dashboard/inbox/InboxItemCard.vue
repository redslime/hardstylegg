<script setup lang="ts">
import type {InboxAlbum, InboxArtist, InboxItem, InboxTrack} from "~/types/models";
import type {RichArtist} from "~/types/content";
import CloudArrowDownIcon from "~/components/icons/CloudArrowDownIcon.vue";
import Xmark from "~/components/icons/Xmark.vue";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import EyeSlashIcon from "~/components/icons/EyeSlashIcon.vue";
import RemapIcon from "~/components/icons/RemapIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";

const { item, artists, day, selectDay } = defineProps({
  item: { type: Object as PropType<InboxItem>, required: true },
  artists: { type: Array as PropType<RichArtist[]>, required: true },
  day: { type: String, required: true },
  selectDay: { type: String, required: true }
})
const emit = defineEmits<{
  submit: [item: InboxItem],
  discard: [item: InboxItem],
  newArtists: [artists: RichArtist[]]
}>()

const isAlbum = computed<boolean>(() => "tracks" in item)
const imgLoaded = ref<boolean>(false)
const submitted = ref<boolean>(false)
const editing = ref<boolean>(false)
const showMenu = ref<boolean>(false)
const menuPosition = ref<{left: number, top: number} | null>(null)
const showArtistMenu = ref<boolean>(false)
const artistMenuTarget = ref<InboxArtist | null>(null)
const artistMenuPosition = ref<{left: number, top: number} | null>(null)
const importingArtists = ref<boolean>(false)
const artistsReady = computed<boolean>(() => {
  const artistIds = artists.map(a => a.id)
  return itemArtists.value.every(a => artistIds.includes(a.id))
})
const artistsMissing = computed<InboxArtist[]>(() => {
  const artistIds = artists.map(a => a.id)
  return itemArtists.value.filter(a => !artistIds.includes(a.id))
})
const itemArtists = computed<InboxArtist[]>(() => {
  if(!isAlbum.value) {
    return item.artists
  } else {
    return [...new Set([...getAlbumTracks().flatMap(t => t.artists), ...item.artists]).values()]
  }
})

function artistsExists(artist: InboxArtist): boolean {
  return artists.map(a => a.id).includes(artist.id)
}

function getAlbumTracks(): InboxTrack[] {
  return (item as InboxAlbum).tracks
}

function openMenu(event: PointerEvent) {
  menuPosition.value = {left: event.pageX, top: event.pageY}
  showMenu.value = true
}

function openArtistMenu(event: PointerEvent, artist: InboxArtist) {
  artistMenuTarget.value = artist
  artistMenuPosition.value = {left: event.pageX, top: event.pageY}
  showArtistMenu.value = true
}

function select() {
  if(artistsReady.value) {
    emit("submit", item)
    submitted.value = true
  }
}

function clicked(event: PointerEvent) {
  if(artistsReady.value) {
    emit("submit", item)
    submitted.value = !submitted.value
  } else {
    openMenu(event)
  }
}

async function importArtists() {
  const imported: RichArtist[] = []
  importingArtists.value = true

  for(const missing of artistsMissing.value) {
    try {
      const fetched = await $fetch<RichArtist>("/api/dashboard/inbox/import-artist", {
        method: "POST",
        body: missing
      })
      imported.push(fetched)
    } catch (e: any) {
      console.error(e)
      return;
    }
  }

  importingArtists.value = false
  emit("newArtists", imported)
}

function toggleHidden() {
  item.hidden = !item.hidden
  showMenu.value = false
}

function removeArtist(artist: InboxArtist) {
  if(isAlbum.value) {
    (item as InboxAlbum).tracks = (item as InboxAlbum).tracks.map(t => {
      t.artists = t.artists.filter(a => a.id !== artist.id)
      return t
    })
  }

  item.artists = item.artists.filter(a => a.id !== artist.id)
  showArtistMenu.value = false
}

function replaceArtist(from: InboxArtist, to: RichArtist) {
  if(isAlbum.value) {
    (item as InboxAlbum).tracks = (item as InboxAlbum).tracks.map(t => {
      t.artists = t.artists.map(a => {
        if(a.id === from.id) {
          return to as InboxArtist
        } else {
          return a
        }
      })
      return t
    })
  }

  item.artists = item.artists.map(a => {
    if(a.id === from.id) {
      return to as InboxArtist
    } else {
      return a
    }
  })
  showArtistMenu.value = false
}

watch(() => selectDay, (newDay) => {
  if(newDay === day) {
    select()
  }
})
</script>

<template>
  <div class="rounded-lg shadow p-2 border border-neutral/50 transition-colors cursor-pointer"
    :class="{
        'hover:border-success': artistsReady,
        'hover:border-error': !artistsReady,
        'bg-success/30': submitted,
        'bg-base-300': item.hidden
      }"
    @click="clicked" @contextmenu.prevent="openMenu">
    <div class="flex gap-2">
      <div class="flex flex-col justify-start">
        <div class="h-[130px] w-[130px]">
          <div v-if="!imgLoaded" class="skeleton w-full h-full rounded-xl inset-0"></div>
          <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-xl"
               @load="imgLoaded = true" :src="`https://i.scdn.co/image/${item.cover_art}`" alt="" />
        </div>
        <div class="max-w-[130px]">
          <div class="text-sm font-semibold" @click.stop="editing = true">
            <template v-if="editing">
              <input type="text" class="input input-xs" autofocus v-model="item.title" @keydown.enter="editing = false" @focusout="editing = false" />
            </template>
            <template v-else>
              {{ item.title }}
            </template>
          </div>
          <div class="text-sm opacity-70">
            <div v-for="artist in item.artists" :key="artist.id">
              <span class="status mb-1 status-success" v-if="artistsExists(artist)"></span>
              <span class="status mb-1 status-error" v-else-if="!importingArtists"></span>
              <template v-else>
                <span class="loading loading-ring text-warning absolute -ml-2 -mt-0.5"></span>
                <span class="status status-warning mb-1"></span>
              </template>

              <span class="hover:underline hover:text-white cursor-pointer ml-1" @contextmenu.prevent.stop="e => openArtistMenu(e, artist)">
                <NuxtLink :to="`/admin/content/artist/${artist.id}`" target="_blank" @click.stop>
                  {{ artist.name }}
                </NuxtLink>
              </span>
            </div>
          </div>
          <div class="text-xs opacity-70">
            {{ new Date(item.date).getFullYear() }}
          </div>
          <div class="badge badge-neutral badge-xs tooltip" v-if="item.hidden"
               data-tip="Hidden tracks don't show up in user-facing input suggestions">
            hidden
          </div>
        </div>
      </div>

      <div class="max-w-[320px]" v-if="isAlbum">
        <div v-for="(track, index) in getAlbumTracks()" :key="track.sid">
          <span class="font-mono text-xs opacity-70">{{ index+1 }}.</span>
          <span class="text-sm font-semibold">{{ track.title }}</span>

          <div class="text-sm opacity-70">
            <div v-for="artist in track.artists" :key="artist.id">
              <span class="status mb-1 status-success" v-if="artistsExists(artist)"></span>
              <span class="status mb-1 status-error" v-else-if="!importingArtists"></span>
              <template v-else>
                <span class="loading loading-ring text-warning absolute -ml-2 -mt-0.5"></span>
                <span class="status status-warning mb-1"></span>
              </template>

              <span class="hover:underline hover:text-white cursor-pointer ml-1" @contextmenu.prevent.stop="e => openArtistMenu(e, artist)">
                <NuxtLink :to="`/admin/content/artist/${artist.id}`" target="_blank" @click.stop>
                  {{ artist.name }}
                </NuxtLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ul class="menu absolute bg-base-200 rounded-box z-10 shadow-xl" v-if="showMenu && menuPosition" @mouseleave="showMenu = false"
    :style="{left: menuPosition.left + 'px', top: menuPosition.top + 'px'}">
    <li class="menu-title text-base-content font-bold text-sm">{{ item.title }}</li>
    <li><a class="font-semibold text-xs" @click="editing = true; showMenu = false">
      <PencilIcon class="text-primary" />
      Edit title
    </a></li>
    <li><a class="font-semibold text-xs" @click="toggleHidden()">
      <EyeSlashIcon class="text-primary" />
      Toggle hidden
    </a></li>
    <li v-if="!artistsReady"><a class="font-semibold text-xs" @click="importArtists()">
      <CloudArrowDownIcon class="text-success" />
      Import missing artists
    </a></li>
    <div class="divider my-1"></div>
    <li><a class="font-semibold text-xs" @click="emit('discard', item); showMenu = false">
      <Xmark class="text-error" />
      Discard
    </a></li>
  </ul>

  <ul class="menu absolute bg-base-200 rounded-box z-10 shadow-xl" v-if="showArtistMenu && artistMenuPosition && artistMenuTarget" @mouseleave="showArtistMenu = false"
      :style="{left: artistMenuPosition.left + 'px', top: artistMenuPosition.top + 'px'}">
    <li class="menu-title text-base-content font-bold text-sm">{{ artistMenuTarget.name }}</li>
    <li>
      <ArtistPicker :title="'Select'" @selected="a => replaceArtist(artistMenuTarget!!, a)">
        <RemapIcon class="text-primary" />
        Remap artist
      </ArtistPicker>
    </li>
    <div class="divider my-1"></div>
    <li><a class="font-semibold text-xs" @click="removeArtist(artistMenuTarget)">
      <Xmark class="text-error" />
      Remove artist
    </a></li>
  </ul>
</template>

<style scoped>

</style>