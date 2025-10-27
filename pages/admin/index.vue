<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

const { user, clear: clearSession } = useUserSession()
const avatarUrl = computed(() => `https://cdn.discordapp.com/avatars/${user.value.discordId}/${user.value.avatar}.png?size=64`)

async function logout () {
  await clearSession()
  await navigateTo('/admin/login')
}
</script>

<template>
  <pre>{{ user }}</pre>
  <div>
    <img :src="avatarUrl" alt="avatar">
    <h1>Welcome {{ user.name }}</h1>
    <button @click="logout">
      Logout
    </button>
  </div>
</template>
