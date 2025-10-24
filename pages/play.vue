<script setup lang="ts">
import {getGameContainer} from "~/utils/game";

const gameData = await getGameContainer()
</script>

<template>
  <GameFlow :gameData="gameData" />
</template>

<style scoped>

</style>