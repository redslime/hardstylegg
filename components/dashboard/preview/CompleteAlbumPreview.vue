<script setup lang="ts">
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {getName} from "~/utils/tracks";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<CompleteAlbumContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="2" :pointer="pointer" :container="instance" :title="getName(instance.album!!)">
    <div v-for="item in instance.items" :key="item.id" class="badge badge-outline"
         :class="{'badge-info': item.hidden}">
      {{ item.name }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>