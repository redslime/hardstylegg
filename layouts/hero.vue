<script setup lang="ts"></script>

<template>
  <div class="flex flex-col w-full mt-10 md:mt-20">
    <div class="flex justify-center">
      <div class="base md:mx-10 bg-primary-content rounded-md shadow-2xl w-full max-w-4xl">
        <h1 class="grow text-center text-accent italic font-normal text-5xl md:text-7xl py-2">
          <NuxtLink to="/">hardstyle.gg</NuxtLink>
        </h1>

        <div class="flex base-content items-center flex-col my-4 lg:m-4 p-4 rounded-sm">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');

h1 {
  font-family: "Anton", sans-serif;
}
</style>