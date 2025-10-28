<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const gameName = useRoute().params.name?.toString()?.replace("-", "")
</script>

<template>
  <div>

  </div>
</template>

<style scoped>

</style>