<script setup lang="ts">
import {findGameByName} from "~/utils/game/clientGameRegistry";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const name = ((useRoute().params.name) as string).replace("-", "")
const gameDef = findGameByName(name)

if(!gameDef) {
  navigateTo('/admin/')
}
</script>

<template>
  <component v-if="gameDef" :is="gameDef.editorComponent" />
</template>

<style scoped>

</style>