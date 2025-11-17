<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import {getName} from "i18n-iso-countries"

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<MapContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="10" :pointer="pointer" :container="instance" :title="instance.title">
    <div class="badge badge-outline badge-info">{{ getName(instance.goal, "en") }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>