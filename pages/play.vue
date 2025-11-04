<script setup lang="ts">
import {getGameContainer} from "~/utils/game";
import type {CookieDayMemory} from "~/types/models";

const { data: gameData, pending, error } = await useAsyncData(() => getGameContainer(), { lazy: true })
const cookie = useCookie<CookieDayMemory[]>("memory", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "strict",
  default: () => []
})
</script>

<template>
  <template v-if="pending">
    <span class="loading loading-spinner loading-xl"></span>
  </template>

  <GameFlow v-if="gameData" :gameData="gameData" :cookie="cookie" />
</template>

<style scoped>

</style>