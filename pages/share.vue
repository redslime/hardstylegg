<script setup lang="ts">
const query = useRoute().query
let imageUrl = "https://hardstyle.gg/api/og"
let width = 550

if(query.c) {
  imageUrl += "?c=" + query.c
} else if(query.r) {
  imageUrl += "?r=" + query.r
} else if(query.ic && query.s) {
  imageUrl += "?ic=" + query.ic
  width = 650
} else if(query.icc && query.s) {
  imageUrl += "?icc=" + query.s
  width = 650
}

useHead({
  meta: [
    { property: 'og:description', content: 'Daily hardstyle challenge to compete with friends.' },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: 'hardstyle.gg' },
    { property: 'og:image:width', content: `${width}` },
    { property: 'og:image:height', content: '140' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})

onMounted(() => {
  if(query.ic || query.icc) {
    navigateTo({
      path: '/play/infinity',
      query
    })
  } else {
    navigateTo('/')
  }
})
</script>

<template>
  <span class="loading loading-spinner loading-xl text-center"></span>
</template>

<style scoped>

</style>