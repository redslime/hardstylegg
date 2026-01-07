<script setup lang="ts">
const { canInstall, promptInstall } = usePwaInstall();
const { title } = defineProps({
  title: { type: String, default: "Don't miss the next challenge!" }
})
const permissionStatus = ref<NotificationPermission | 'unsupported'>('default');
const shouldShow = computed(() => permissionStatus.value === 'default' || canInstall.value)

async function enableNotifications() {
  if (permissionStatus.value === 'unsupported') return;

  const permission = await Notification.requestPermission();
  permissionStatus.value = permission;

  if (permission === 'granted') {
    new Notification('hardstyle.gg', {
      body: 'Notifications enabled! See you tomorrow!',
      icon: '/img/icon.png'
    });
  }
}

onMounted(() => {
  if(import.meta.client) {
    // check notification state
    if (!('Notification' in window)) {
      permissionStatus.value = 'unsupported';
    } else {
      permissionStatus.value = Notification.permission;
    }
  }
});
</script>

<template>
  <div v-if="shouldShow" class="bg-base-200 border-l-4 border-primary p-4 rounded-r-lg shadow-lg my-6">
    <div class="flex flex-col items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-primary/10 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div class="text-center">
          <h3 class="font-bold text-lg">{{ title }} <span class="text-error text-xs font-light align-top">BETA</span></h3>
          <p class="text-sm opacity-70">Enable notifications or install the app to get reminded of the daily challenge.</p>
        </div>
      </div>
      
      <div class="flex gap-2 w-full md:w-4/5">
        <button v-if="canInstall" @click="promptInstall" class="btn btn-primary flex-1">
          Install App
        </button>
        <button v-if="permissionStatus === 'default'" @click="enableNotifications" class="btn btn-outline flex-1">
          Notify Me
        </button>
      </div>
    </div>
  </div>
</template>
