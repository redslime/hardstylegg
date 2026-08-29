<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";
import WordleString from "~/components/games/wordle/WordleString.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const { instance, pointer = true } = defineProps<{
  instance: WordleContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <WordleString :guess="instance.artist.name" :solution="instance.artist.name" />
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>