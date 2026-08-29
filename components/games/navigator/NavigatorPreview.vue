<script setup lang="ts">
import type {NavigatorContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NavigatorDef
const { instance, pointer = true } = defineProps<{
  instance: NavigatorContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ instance.from.getDisplayName() }} → {{ instance.to.getDisplayName() }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>