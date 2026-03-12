<script setup lang="ts">
import type {GameData} from "~/types/models";
import {debug} from "~/utils/utils";

const { $gameRegistry } = useNuxtApp();
const { gameData } = defineProps({
  gameData: { type: Object as PropType<GameData[]>, required: true }
})

debug("Preloading...")

requestIdleCallback(() => {
  gameData.forEach(game => {
    const gameDef = $gameRegistry.findGameByName(game.name)

    if(gameDef) {
      const container = gameDef.remap(game.props.container)
      gameDef.getPreloadUrls(container).forEach(url => {
        debug(`Preloading ${url} for ${game.name}`)

        const img = new Image()
        img.src = url
      })
    }
  })
})
</script>

<template>

</template>

<style scoped>

</style>