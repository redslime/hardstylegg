<script setup>
import Header from "~/components/Header.vue";

const darkmodeCookie = useCookie('darkmode', { default: () => true })
provide("darkmodeCookie", darkmodeCookie)

onMounted(() => {
  document.documentElement.setAttribute('data-theme', darkmodeCookie.value ? 'night' : 'light')
})
</script>

<template>
  <NuxtLayout>
    <div class="flex justify-center min-h-screen mb-10 md:mb-0">
      <div class="base w-4xl bg-primary-content shadow-xl">
        <Header />
        <div class="flex base-content items-center flex-col my-4 lg:m-4 p-4 rounded-sm">
          <NuxtPage />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>

</style>
