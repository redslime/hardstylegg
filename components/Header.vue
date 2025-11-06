<script setup lang="ts">
import {getGameContainer} from "~/utils/game";

const { data: gameData, pending, error } = await useAsyncData(() => getGameContainer(), { lazy: true })
</script>

<template>
  <h1 class="grow text-center text-accent italic font-normal text-5xl md:text-7xl py-2">
    <NuxtLink to="/">hardstyle.gg</NuxtLink>
  </h1>
  <h2 v-if="gameData && gameData.theme" class="text-center text-md md:text-xl -mt-2 opacity-90 font-medium">{{ gameData.theme }}</h2>
  <hr>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');

h1 {
  font-family: "Anton", sans-serif;
}
</style>