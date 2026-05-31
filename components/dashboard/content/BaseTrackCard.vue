<script setup lang="ts">
import type {PropType} from "vue";
import {RichAlbum, RichArtist, RichTrack} from "~/types/content";
import EyeSlashIcon from "~/components/icons/EyeSlashIcon.vue";
import {updateDashboardAlbum, updateDashboardTrack} from "~/utils/dashboard";
import Xmark from "~/components/icons/Xmark.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import {addRecentArtist, getRecentArtists} from "~/utils/contentCache";

const { user } = useUserSession()
const { item } = defineProps({
  item: { type: Object as PropType<RichAlbum | RichTrack>, required: true }
})
const isAlbum = computed<boolean>(() => item instanceof RichAlbum)
const imgLoaded = ref<boolean>(false)
const showMenu = ref<boolean>(false)
const showArtistMenu = ref<RichArtist | undefined>()
const menuPosition = ref<{left: number, top: number} | null>(null)
const editTitle = ref<boolean>(false)
const savingTitle = ref<boolean>(false)
const savingError = ref<boolean>(false)

async function saveTitle() {
  editTitle.value = false
  await save()
}

async function toggleHidden() {
  if(item) {
    item.hidden = !item.hidden
    showMenu.value = false

    if(isAlbum.value) {
      await $fetch<RichAlbum>("/api/dashboard/edit/album", {
        method: "POST",
        body: RichAlbum.mapJson(item)
      }).then(RichAlbum.fromJson).then(updateDashboardAlbum)
    } else {
      await $fetch<RichTrack>("/api/dashboard/edit/track", {
        method: "POST",
        body: RichTrack.mapJson(item)
      }).then(RichTrack.fromJson).then(updateDashboardTrack)
    }
  }
}

function openMenu(event: PointerEvent) {
  if(user.value.admin) {
    menuPosition.value = {left: event.pageX, top: event.pageY}
    showMenu.value = true
  }
}

function openArtistMenu(event: PointerEvent, artist: RichArtist) {
  if(user.value.admin) {
    menuPosition.value = {left: event.pageX, top: event.pageY}
    showArtistMenu.value = artist
  }
}

async function removeArtist(artist: RichArtist) {
  if(item) {
    item.artists = item.artists.filter(a => a.id !== artist.id)
    await save()
  }
}

async function addArtist(artist: RichArtist) {
  if(item && !item.artists.map(a => a.id).includes(artist.id)) {
    item.artists.push(artist)
    addRecentArtist(artist)
    await save()
  }
}

async function save() {
  showMenu.value = false
  savingTitle.value = true

  try {
    await $fetch<RichTrack>("/api/dashboard/edit/track", {
      method: "POST",
      body: RichTrack.mapJson(item)
    }).then(RichTrack.fromJson).then(updateDashboardTrack)
    savingTitle.value = false
  } catch (e: any) {
    savingTitle.value = false
    savingError.value = true
  }
}
</script>

<template>
  <div class="rounded-lg shadow p-2 flex flex-col justify-start
      border border-neutral/50 transition-colors hover:border-primary cursor-pointer"
       :class="{ 'bg-base-300': !item.hidden, 'bg-black/50 border-dashed': item.hidden }"
      @click="isAlbum ? navigateTo(`/admin/content/album/${item.sid}`) : navigateTo(`/admin/content/track/${item.sid}`)"
      @contextmenu.prevent="openMenu">
    <div class="h-[130px] w-[130px]">
      <div v-if="!imgLoaded && item.image" class="skeleton w-full h-full rounded-xl inset-0"></div>
      <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-xl"
           @load="imgLoaded = true" loading="lazy" decoding="async" :src="item.getImageUrl()" v-if="item.image" alt="" />
      <div v-if="!item.image" class="w-full min-h-[130px] rounded-xl bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
        <span class="text-xs opacity-50 text-center px-1">No image</span>
      </div>
    </div>
    <div class="max-w-[130px]">
      <div class="text-sm font-semibold" @click.stop="editTitle = true">
        <template v-if="editTitle">
          <input type="text" class="input input-xs" autofocus v-model="item.title" @keydown.enter="saveTitle()" @focusout="saveTitle()" />
        </template>
        <template v-else>
          {{ item.title }}
          <span class="loading loading-xs loading-dots" v-if="savingTitle"></span>
          <span class="badge badge-xs badge-soft badge-error" v-if="savingError">failed</span>
        </template>
      </div>
      <div class="text-sm opacity-70">
        <template v-for="(artist, index) in item.artists" :key="index">
          <span class="hover:underline hover:text-white cursor-pointer" @contextmenu.prevent.stop="e => openArtistMenu(e, artist)">
            <NuxtLink :to="`/admin/content/artist/${artist.id}`">
              {{ artist.getDisplayName() }}
            </NuxtLink>
          </span>
          <span v-if="index !== item.artists.length-1"> & </span>
        </template>
      </div>
      <div class="text-xs opacity-70">
        <span class="hover:underline hover:text-white cursor-pointer">
          <NuxtLink :to="`/admin/content/year/${item.year}`">
            {{ item.year }}
          </NuxtLink>
        </span>
      </div>
      <div class="badge badge-neutral badge-xs tooltip" v-if="item.hidden"
           data-tip="Hidden tracks don't show up in user-facing input suggestions">
        hidden
      </div>
    </div>
  </div>

  <ul class="menu absolute bg-base-100 rounded-box z-10 shadow-xl" v-if="showMenu && menuPosition" @mouseleave="showMenu = false"
      :style="{left: menuPosition.left + 'px', top: menuPosition.top + 'px'}">
    <li class="menu-title text-base-content font-bold text-sm">{{ item.title }}</li>
    <li><a class="font-semibold text-xs" @click="toggleHidden()">
      <EyeSlashIcon class="text-primary" />
      Toggle hidden
    </a></li>
    <li>
      <a class="font-semibold text-xs">
        <ArtistPicker :title="'Add'" :style="'hover:btn-primary rounded-full btn-lg flex gap-2 items-center'" :button="false" @selected="addArtist">
          <PlusIcon class="text-success" />
          Add artist
        </ArtistPicker>
      </a>
    </li>
    <template v-if="getRecentArtists().length > 0">
      <div class="divider -my-0.5"></div>
      <div class="menu-title text-base-content/70 uppercase text-xs font-bold">Add Recent Artists</div>
      <li v-for="recent in getRecentArtists()" class="flex flex-row gap-2 items-center" :key="recent.id">
        <a class="font-semibold text-xs" @click="addArtist(recent)">
          <img class="w-6 h-6 rounded-full" :src="recent.getImageUrl()" :alt="recent.getDisplayName()" />
          {{ recent.getDisplayName() }}
        </a>
      </li>
    </template>
  </ul>

  <ul class="menu absolute bg-base-100 rounded-box z-10 shadow-xl" v-if="showArtistMenu && menuPosition" @mouseleave="showArtistMenu = undefined"
      :style="{left: menuPosition.left + 'px', top: menuPosition.top + 'px'}">
    <li class="menu-title text-base-content font-bold flex flex-row gap-2 items-center">
      <img class="w-6 h-6 rounded-full" :src="showArtistMenu.getImageUrl()" :alt="showArtistMenu.getDisplayName()" />
      {{ showArtistMenu.getDisplayName() }}
    </li>
    <li><a class="font-semibold text-xs" @click="removeArtist(showArtistMenu)">
      <Xmark class="text-error" />
      Remove
    </a></li>
  </ul>
</template>

<style scoped>

</style>