<script setup lang="ts">

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { $gameRegistry } = useNuxtApp();
const name = ((useRoute().params.name) as string).replaceAll("-", "")
const gameDef = $gameRegistry.findGameByName(name)

if(!gameDef) {
  navigateTo('/admin/')
}
</script>

<template>
  <component v-if="gameDef" :is="gameDef.editorComponent" />
</template>

<style scoped>

</style>