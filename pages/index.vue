<script setup lang="ts">
import {transform} from "~/utils/game";
import type {GameContainer, PackedDayData} from "~/types/models";

const { data, pending, error, refresh } = await useAsyncData(
    () => $fetch('/api/today')
    // ,{ lazy: true } // ensures it fetches client-side only
)
const gameData = computed<GameContainer>(() => {
  return transform(data.value as PackedDayData)
})
</script>

<template>
  <GameFlow :gameData="gameData" />
</template>

<style scoped>

</style>