<script setup lang="ts">
import type {LostInTranslationContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.LostInTranslationDef
const { instance, pointer = true } = defineProps<{
  instance: LostInTranslationContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info h-auto">{{ instance.translationChain }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>