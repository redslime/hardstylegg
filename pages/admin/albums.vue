<script setup lang="ts">
import {getDashboardAlbums} from "~/utils/dashboard";
import TrackAlbumGrid from "~/components/dashboard/TrackAlbumGrid.vue";
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const { data: albums, pending, error } = await useAsyncData(() => getDashboardAlbums(), { lazy: true })
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    Album database
  </div>

  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <template v-if="albums">
    <TrackAlbumGrid :items="albums" :hideTitle="true" :selectable="false" :editable="user.admin" />
  </template>
</template>

<style scoped>

</style>