<script setup lang="ts">

import Header from "~/components/Header.vue";
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="base w-full mx-10 bg-base-300 shadow-xl">
      <Header />
      <div class="flex base-content items-center bg-base-100 flex-col my-4 lg:m-4 py-4 rounded-sm">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>