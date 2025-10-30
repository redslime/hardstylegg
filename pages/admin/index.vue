<script setup lang="ts">
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import type {Track} from "~/types/models";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const avatarUrl = computed(() => `https://cdn.discordapp.com/avatars/${user.value.discordId}/${user.value.avatar}.png?size=64`)
const selected = ref<Track | null>()
</script>

<template>
  <div v-if="selected">
    Selected: {{ selected.artists }} - {{ selected.title}}
  </div>
  <TrackPicker @selected="t => selected = t" />
</template>
