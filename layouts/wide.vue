<script setup lang="ts">

import Header from "~/components/Header.vue";
</script>

<template>
  <div class="flex justify-center min-h-screen mb-20 md:mb-0">
    <div class="base w-full mx-10 bg-primary-content shadow-xl">
      <Header />
      <div class="flex base-content items-center flex-col my-4 lg:m-4 p-4 rounded-sm">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>