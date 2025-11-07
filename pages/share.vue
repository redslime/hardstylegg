<script setup lang="ts">
const query = useRoute().query

if(query.r) {
  useHead({
    meta: [
      {name: 'og:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:image:src', content: 'https://hardstyle.gg/api/og?r=' + query.r},
      {name: 'twitter:image:alt', content: 'hardstyle.gg'},
      {name: 'twitter:image:width', content: '550'},
      {name: 'twitter:image:height', content: '140'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'theme-color', content: '#3ABDF8'},
    ]
  })
} else if(query.c) {
  useHead({
    meta: [
      {name: 'og:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:image:src', content: 'https://hardstyle.gg/api/og?c=' + query.c},
      {name: 'twitter:image:alt', content: 'hardstyle.gg'},
      {name: 'twitter:image:width', content: '550'},
      {name: 'twitter:image:height', content: '140'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'theme-color', content: '#3ABDF8'},
    ]
  })
}

onMounted(() => {
  navigateTo('/')
})
</script>

<template>

</template>

<style scoped>

</style>