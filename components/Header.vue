<script setup lang="ts">
import {getGameContainer, isGameActive} from "~/utils/game";

const { showTheme } = defineProps({
  showTheme: { type: Boolean, default: true }
})
const { data: gameData } = showTheme
    ? await useAsyncData('header-container', () => getGameContainer(), { lazy: true })
    : { data: ref(null) }
const path = useRoute().path
const target = computed(() => {
  if(path == "/play") {
    if(isGameActive()) {
      return path
    }
  }

  return "/"
})

</script>

<template>
  <h1 class="anton grow text-center text-accent italic font-normal text-5xl md:text-7xl py-2">
    <NuxtLink :to="target">hardstyle.gg</NuxtLink>
  </h1>
  <h2 v-if="gameData && gameData.theme" class="text-center text-md md:text-xl -mt-2 opacity-90 font-medium">{{ gameData.theme }}</h2>
  <hr>
</template>

<style scoped>
</style>