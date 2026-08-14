<script setup>
import Header from "~/components/Header.vue";
import {usePwaInstall} from "~/composables/usePwaInstallationHandler.ts";

const isMobile = ref(false)
const isApp = ref(false)
const { initInstallListener } = usePwaInstall()

onMounted(() => {
  const mq = window.matchMedia('(max-width: 767px)')
  const app = window.matchMedia('(display-mode: standalone)')

  isMobile.value = mq.matches
  isApp.value = app.matches

  mq.addEventListener('change', e => isMobile.value = e.matches)
  app.addEventListener('change', e => isApp.value = e.matches)

  initInstallListener()
})

provide("isMobile", isMobile)
provide("isApp", isApp)
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
