<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import {getName} from "~/utils/tracks";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<HeardleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="4" :pointer="pointer" :container="instance" :title="getName(instance.track)">
    <WaveformPreview class="w-full" :container="instance" />
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>