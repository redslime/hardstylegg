<script setup lang="ts">
import type {HeardleContainer} from "~/types/gameModels";
import WaveformPreview from "~/components/games/heardle/WaveformPreview.vue";
import LoadLazy from "../../LoadLazy.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.HeardleDef
const { instance, pointer = true } = defineProps<{
  instance: HeardleContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <LoadLazy>
      <WaveformPreview class="w-full" :container="instance" />
    </LoadLazy>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>