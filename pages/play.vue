<script setup lang="ts">
const query = useRoute().query
console.log(query)

if(query.r) {
  useHead({
    meta: [
      {name: 'og:title', content: 'hardstyle.gg'},
      {name: 'og:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:title', content: 'hardstyle.gg'},
      {name: 'twitter:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:image:src', content: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r},
      {name: 'twitter:image:alt', content: 'hardstyle.gg'},
      {name: 'twitter:image:width', content: '550'},
      {name: 'twitter:image:height', content: '140'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'theme-color', content: '#3ABDF8'},
    ]
  })
}

if(query.f) {
  useHead({
    meta: [
      {name: 'twitter:image:src', content: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.f},
      {name: 'twitter:image:alt', content: 'hardstyle.gg'},
      {name: 'twitter:image:width', content: '550'},
      {name: 'twitter:image:height', content: '140'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'theme-color', content: '#3ABDF8'},
    ]
  })
}

if(query.g) {
  useHead({
    meta: [
      {name: 'og:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:description', content: 'Daily hardstyle challenge to compete with friends.'},
      {name: 'twitter:image:src', content: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.g},
      {name: 'twitter:image:alt', content: 'hardstyle.gg'},
      {name: 'twitter:image:width', content: '550'},
      {name: 'twitter:image:height', content: '140'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'theme-color', content: '#3ABDF8'},
    ]
  })
}


navigateTo('/')
</script>

<template>
  {{query.r}}
</template>

<style scoped>

</style>