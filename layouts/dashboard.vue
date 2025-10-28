<script setup lang="ts">
import type {DashboardItem} from "~/types/models";
import DashboardMenu from "~/components/dashboard/DashboardMenu.vue";

const { user, clear: clearSession } = useUserSession()
const avatarUrl = computed(() => `https://cdn.discordapp.com/avatars/${user.value.discordId}/${user.value.avatar}.png?size=64`)

async function logout () {
  await clearSession()
  await navigateTo('/admin/login')
}

function select(item: DashboardItem) {
  navigateTo(item.url)
}
</script>

<template>
  <div class="w-full">
    <div class="navbar bg-base-300 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">hardstyle.gg Dashboard</a>
      </div>
      <div class="flex-none">
        <div class="w-10">
          <img class="rounded-full" alt="Avatar" :src="avatarUrl" />
        </div>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><a>{{ user.name }}</a></li>
          <li><a @click="logout">Log out</a></li>
        </ul>
      </div>
    </div>

    <div class="w-full">
      <div class="flex">
        <DashboardMenu :select="select" />

        <div class="w-full bg-base-100 p-2 lg:p-7">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>