<script setup lang="ts">
import DiscordLoginButton from "~/components/DiscordLoginButton.vue";

definePageMeta({
  layout: 'hero',
})

const query = useRoute().query
const { loggedIn } = useUserSession()
const isInitial = await $fetch<boolean>("/api/dashboard/loginToken")
const tokenInput = ref<string>("")
const awaitingLogin = ref<boolean>(false)

async function tryTokenInput() {
  awaitingLogin.value = true
  navigateTo("/auth/token?token=" + tokenInput.value, { external: true })
}

if(loggedIn.value) {
  navigateTo('/admin')
}
</script>

<template>
  <div role="alert" class="alert alert-error alert-dash mb-8" v-if="query.error">
    <span class="font-bold">Error!</span> {{ query.error }}. Please try again.
  </div>

  <template v-if="isInitial">
    <div class="card bg-neutral text-neutral-content w-96">
      <div class="card-body">
        <h2 class="card-title">First login</h2>
        <p>It seems like you are logging in for the first time! Check the server log for the login token and enter it below to continue:</p>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Login token</legend>
          <input type="text" class="input" v-model="tokenInput" />
        </fieldset>

        <p>You will be sent to Discord to link your account.</p>

        <button class="btn btn-success w-fit" :disabled="tokenInput.length === 0" @click="tryTokenInput" v-if="!awaitingLogin">Log in</button>
        <button class="btn btn-success w-fit" disabled v-else><span class="loading loading-spinner"></span></button>
      </div>
    </div>
  </template>

  <DiscordLoginButton v-else />
</template>

<style scoped>
</style>