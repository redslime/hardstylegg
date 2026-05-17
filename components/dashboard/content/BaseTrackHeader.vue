<script setup lang="ts">
import {RichAlbum, RichTrack} from "~/types/content";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import type {List} from "~/types/models";
import ListBadge from "~/components/dashboard/list/ListBadge.vue";

const { user } = useUserSession()
const { item, linkedLists } = defineProps({
  item: { type: Object as PropType<RichAlbum | RichTrack>, required: true },
  linkedLists: { type: Array as PropType<List[]>, default: () => [] }
})
const isAlbum = computed<boolean>(() => item instanceof RichAlbum)
const editUrl = computed<string>(() => isAlbum.value ? `/admin/content/album/${item.sid}/edit` : `/admin/content/track/${item.sid}/edit`)
</script>

<template>
  <div class="bg-black/40 py-10 px-5 rounded-t-xl relative">
    <div class="absolute top-5 right-5" v-if="user.admin">
      <button class="btn btn-accent btn-soft btn-lg" @click="navigateTo(editUrl)">
        <PencilIcon />
        Edit
      </button>
    </div>

    <div class="flex items-center gap-5">
      <img :src="item.getImageUrl()" class="size-80 rounded-xl" alt="Artwork"/>
      <div class="flex flex-col gap-2">
        <div class="badge badge-neutral badge-lg tooltip" v-if="item.hidden"
             data-tip="Hidden tracks don't show up in user-facing input suggestions">
          hidden
        </div>

        <div class="text-5xl font-bold">
          {{ item.title }}
        </div>

        <span class="w-fit text-sm hover:underline hover:text-white cursor-pointer">
          <NuxtLink :to="`/admin/content/year/${item.year}`">
            {{ item.getFriendlyDate() }}
          </NuxtLink>
        </span>

        <div class="text-xl flex flex-wrap gap-2 text-base-content/80">
          <template v-for="artist in item.artists" :key="artist.id">
            <div class="w-fit hover:bg-primary/35 bg-primary/20 hover:shadow-md hover:shadow-primary/50 transition-all cursor-pointer rounded-full pr-3 p-1"
                 @click="navigateTo(`/admin/content/artist/${artist.id}`)">
              <div class="flex gap-2 items-center">
                <img :src="artist.getImageUrl()" class="size-10 rounded-full"  alt="Artist image" v-if="artist.image" />
                <p class="text-primary/90 leading-10">{{ artist.getDisplayName() }}</p>
              </div>
            </div>
          </template>
        </div>

        <div class="flex flex-wrap gap-2 mt-4" v-if="linkedLists.length > 0">
          <ListBadge v-for="list in linkedLists" :key="list.id" :list="list" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>