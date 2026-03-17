<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<WordleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ instance.artist.name }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>