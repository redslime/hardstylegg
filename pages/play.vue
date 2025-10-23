<script setup lang="ts">
definePageMeta({
  ssr: true
})

const query = useRoute().query
console.log(query)

if(query && query.r) {
  useSeoMeta({
    title: 'hardstyle.gg',
    ogTitle: 'hardstyle.gg',
    description: 'Daily hardstyle challenge to compete with friends.',
    ogDescription: 'Daily hardstyle challenge to compete with friends.',
    ogImage: 'https://hardstylegg.redslime.xyz/api/og?r=' + query.r,
  })
}

navigateTo('/')
</script>

<template>
  {{query.r}}
</template>

<style scoped>

</style>