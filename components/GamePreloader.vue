<script setup lang="ts">
import type {GameData} from "~/types/models";
import {debug} from "~/utils/utils";
import {findGameByName} from "~/utils/game/clientGameRegistry";

const { gameData } = defineProps({
  gameData: { type: Object as PropType<GameData[]>, required: true }
})

debug("Preloading...")

requestIdleCallback(() => {
  gameData.forEach(game => {
    const comp = findGameByName(game.name)

    if(comp && comp.gameComponent && comp.gameComponent.getPreloadUrls) {
      const urls: string[] = comp.gameComponent.getPreloadUrls(game.props.container)

      debug(`Preloading ${urls.length} images for ${game.name}`)
      urls.forEach(url => {
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