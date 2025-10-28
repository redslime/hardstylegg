<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user, clear: clearSession } = useUserSession()
const avatarUrl = computed(() => `https://cdn.discordapp.com/avatars/${user.value.discordId}/${user.value.avatar}.png?size=64`)
</script>

<template>
index helloooo
</template>
