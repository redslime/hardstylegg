<script setup lang="ts">
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import {getDashboardTracks} from "~/utils/dashboard";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data: tracks, pending, error } = await useAsyncData(() => getDashboardTracks(), { lazy: true })
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    Track database
  </div>

  <span class="loading loading-spinner loading-xl" v-if="pending"></span>

  <div role="alert" class="alert alert-error alert-soft" v-if="error">
    <span>Failed to load tracks</span>
  </div>

  <div class="w-full" v-if="tracks">

  </div>
</template>

<style scoped>

</style>