<script setup lang="ts">
import type {LostInTranslationContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.LostInTranslationDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<LostInTranslationContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info h-auto">{{ instance.translationChain }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>