<script setup lang="ts">
import {getGameContainer} from "~/utils/game";

const { data: gameData, pending, error } = await useAsyncData(() => getGameContainer(), { lazy: true })
</script>

<template>
  <template v-if="pending">
    <span class="loading loading-spinner loading-xl"></span>
  </template>

  <GameFlow v-if="gameData" :gameData="gameData" />
</template>

<style scoped>

</style>