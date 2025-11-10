<script setup lang="ts">
const query = useRoute().query
let imageUrl = "https://hardstyle.gg/api/og"

if(query.c) {
  imageUrl += "?c=" + query.c
} else if(query.r) {
  imageUrl += "?r=" + query.r
}

useHead({
  meta: [
    { property: 'og:description', content: 'Daily hardstyle challenge to compete with friends.' },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: 'hardstyle.gg' },
    { property: 'og:image:width', content: '550' },
    { property: 'og:image:height', content: '140' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})

onMounted(() => {
  navigateTo('/')
})
</script>

<template>

</template>

<style scoped>

</style>