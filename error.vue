<script setup lang="ts">
import Header from "~/components/Header.vue";
import type {NuxtError} from '#app'

const { error } = defineProps({
  error: Object as () => NuxtError,
})
</script>

<template>
  <div class="flex justify-center min-h-screen mb-20 md:mb-0">
    <div class="base w-4xl bg-primary-content shadow-xl">
      <Header />
      <div class="flex base-content items-center flex-col my-4 lg:m-4 p-4 rounded-sm">
        <h1 class="text-5xl font-bold mb-5">Error {{ error?.statusCode }}</h1>
        <p class="text-xl">{{ error?.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>