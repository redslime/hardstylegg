<script setup lang="ts">
import DiscordIcon from "~/components/icons/DiscordIcon.vue";
</script>

<template>
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