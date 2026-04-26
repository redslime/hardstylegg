<script setup lang="ts">
import type {NavigatorContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NavigatorDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<NavigatorContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ instance.from.getDisplayName() }} → {{ instance.to.getDisplayName() }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>