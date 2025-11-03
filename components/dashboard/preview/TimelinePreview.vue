<script setup lang="ts">
import type {TimelineContainer} from "~/types/gameModels";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<TimelineContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="8" :pointer="pointer" :container="instance" :title="instance.title">
    <div class="badge badge-outline badge-info">{{ instance.goal }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>