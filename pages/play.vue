<script setup lang="ts">
const query = useRoute().query
console.log(query)

if(query.r) {
  // useSeoMeta({
  //   title: 'hardstyle.gg',
  //   ogTitle: 'hardstyle.gg',
  //   description: 'Daily hardstyle challenge to compete with friends.',
  //   ogDescription: 'Daily hardstyle challenge to compete with friends.',
  //   ogImage: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r,
  // })

  useSeoMeta({
    title: 'hardstyle.gg',
    ogTitle: 'hardstyle.gg',
    description: 'Daily hardstyle challenge to compete with friends.',
    ogDescription: 'Daily hardstyle challenge to compete with friends.',
    ogUrl: 'https://hardstylegg.redslime.xyz/',
    ogSiteName: 'hardstyle.gg',
    ogLocale: 'en_US',
    ogType: 'website',
    twitterSite: 'hardstyle.gg',
    twitterDescription: 'Daily hardstyle challenge to compete with friends.',
    twitterImage: {
      url: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r,
      alt: 'hardstyle.gg',
      width: 550,
      height: 140,
    },
    twitterCard: 'summary_large_image',
    themeColor: '#3ABDF8',
  })
}

navigateTo('/')
</script>

<template>
  {{query.r}}
</template>

<style scoped>

</style>