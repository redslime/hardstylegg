<script setup>
import Header from "~/components/Header.vue";
import {usePwaInstall} from "~/composables/usePwaInstallationHandler.ts";

const darkmodeCookie = useCookie('darkmode', { default: () => true })
const isMobile = ref(false)
const { initInstallListener } = usePwaInstall()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', darkmodeCookie.value ? 'night' : 'light')

  const mq = window.matchMedia('(max-width: 767px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', e => isMobile.value = e.matches)

  initInstallListener()
})

provide("darkmodeCookie", darkmodeCookie)
provide("isMobile", isMobile)
</script>

<template>
  <NuxtPwaManifest />
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
