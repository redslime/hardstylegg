<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import WaveformPreview from "~/components/games/heardle/WaveformPreview.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.HeardleDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<HeardleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <WaveformPreview class="w-full" :container="instance" />
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>