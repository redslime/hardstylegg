<script setup lang="ts">
import DiscordIcon from "~/components/icons/DiscordIcon.vue";

const query = useRoute().query
const { loggedIn, user, fetch: refreshSession } = useUserSession()

if(loggedIn.value) {
  navigateTo('/admin')
}
</script>

<template>
  <div role="alert" class="alert alert-error alert-dash mb-8" v-if="query.error">
    <span class="font-bold">Error!</span> {{ query.error }}. Please try again.
  </div>

  <a href="/auth/discord/login" class="btn btn-lg btn-discord">
    <DiscordIcon />
    Login with Discord
  </a>
</template>

<style scoped>
.btn-discord {
  background-color: #5865F2;
  color: white;
}
</style>