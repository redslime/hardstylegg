<script setup>
import Header from "~/components/Header.vue";

const darkmodeCookie = useCookie('darkmode', { default: () => true })
provide("darkmodeCookie", darkmodeCookie)

onMounted(() => {
  document.documentElement.setAttribute('data-theme', darkmodeCookie.value ? 'night' : 'light')
})

const isMobile = ref(false)
onMounted(() => {
  const mq = window.matchMedia('(max-width: 767px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', e => isMobile.value = e.matches)
})
provide("isMobile", isMobile)
</script>

<template>
  <NuxtLayout>
    <div class="flex justify-center min-h-screen mb-20 md:mb-0 overflow-x-hidden">
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
