<script setup lang="ts">
import type {GameData} from "~/types/models";
import {gameComps} from "~/utils/game";
import {debug} from "~/utils/utils";

const { gameData } = defineProps({
  gameData: { type: Object as PropType<GameData[]>, required: true }
})

debug("Preloading...")

requestIdleCallback(() => {
  gameData.forEach(game => {
    const comp = gameComps[game.name as keyof typeof gameComps]

    if(comp && comp.comp && comp.comp.getPreloadUrls) {
      const urls: string[] = comp.comp.getPreloadUrls(game.props.container)

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