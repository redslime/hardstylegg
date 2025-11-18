<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import {HeardleGame} from "~/utils/game/clientGameRegistry";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<HeardleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="HeardleGame" :pointer="pointer" :container="instance">
    <WaveformPreview class="w-full" :container="instance" />
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>