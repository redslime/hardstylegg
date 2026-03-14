<script setup lang="ts">
import type {PropType} from "vue";
import {RichAlbum, RichTrack} from "~/types/content";
import EyeSlashIcon from "~/components/icons/EyeSlashIcon.vue";
import {updateDashboardAlbum, updateDashboardTrack} from "~/utils/dashboard";

const { user } = useUserSession()
const { item } = defineProps({
  item: { type: Object as PropType<RichAlbum | RichTrack>, required: true }
})
const isAlbum = computed<boolean>(() => item instanceof RichAlbum)
const imgLoaded = ref<boolean>(false)
const showMenu = ref<boolean>(false)
const menuPosition = ref<{left: number, top: number} | null>(null)

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
           @load="imgLoaded = true" :src="item.getImageUrl()" v-if="item.image" alt="" />
      <div v-if="!item.image" class="w-full min-h-[130px] rounded-xl bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
        <span class="text-xs opacity-50 text-center px-1">No image</span>
      </div>
    </div>
    <div class="max-w-[130px]">
      <div class="text-sm font-semibold">{{ item.title }}</div>
      <div class="text-sm opacity-70">
        <template v-for="(artist, index) in item.artists" :key="index">
          <span class="hover:underline hover:text-white cursor-pointer">
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

  <ul class="menu absolute bg-base-200 rounded-box z-10 shadow-xl" v-if="showMenu && menuPosition" @mouseleave="showMenu = false"
      :style="{left: menuPosition.left + 'px', top: menuPosition.top + 'px'}">
    <li class="menu-title text-base-content font-bold text-sm">{{ item.title }}</li>
    <li><a class="font-semibold text-xs" @click="toggleHidden()">
      <EyeSlashIcon class="text-primary" />
      Toggle hidden
    </a></li>
  </ul>
</template>

<style scoped>

</style>