<script setup lang="ts">
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import {getDashboardTracks} from "~/utils/dashboard";
import TrackAlbumGrid from "~/components/dashboard/TrackAlbumGrid.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const { data: tracks, pending, error } = await useAsyncData(() => getDashboardTracks(), { lazy: true })
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    Track database
  </div>

  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <template v-if="tracks">
    <TrackAlbumGrid :items="tracks" :hideTitle="true" :selectable="false" :editable="user.admin" />
  </template>
</template>

<style scoped>

</style>