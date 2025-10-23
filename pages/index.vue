<script setup lang="ts">
import {transform} from "~/utils/game";
import {useRoute} from "vue-router";
import type {GameContainer, PackedDayData} from "~/types/models";

const query = useRoute().query

if(query.r) {
  definePageMeta({
    title: 'hardstyle.gg',
    ogTitle: 'hardstyle.gg',
    description: 'Daily hardstyle challenge to compete with friends.',
    ogDescription: 'Daily hardstyle challenge to compete with friends.',
    ogImage: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r,
  })
}

// if(query.r) {
//   useHead({
//     title: 'hardstyle.gg',
//     meta: [
//       { name: 'description', content: 'Daily hardstyle challenge to compete with friends.' },
//       { name: 'og:title', content: 'hardstyle.gg' },
//       { name: 'og:description', content: 'Daily hardstyle challenge to compete with friends.' },
//       { name: 'og:image', content: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r },
//     ],
//     link: [
//       { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
//     ],
//   })
// }

useRouter().replace({ query: {} })

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