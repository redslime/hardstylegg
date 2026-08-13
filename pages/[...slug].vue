<script setup lang="ts">
definePageMeta({ // avoid <Header> rendering on ssr
  layout: 'plain'
})
throw createError({
  statusCode: 404,
  statusMessage: 'Page not found',
})
</script>

<template>
  <div />
</template>