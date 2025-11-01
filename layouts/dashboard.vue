<script setup lang="ts">
import DashboardMenu from "~/components/dashboard/DashboardMenu.vue";
import {getAvatarUrl} from "~/server/utils/utils";
import {getDashboardData} from "~/utils/dashboard";

const { user, clear: clearSession } = useUserSession()
const { data, pending, error } = await useAsyncData(() => getDashboardData(), { lazy: true })
const avatarUrl = computed(() => getAvatarUrl(user.value))

function home() {
  navigateTo('/admin')
}

async function logout () {
  await clearSession()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="w-full">
    <div class="navbar bg-base-300 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl" @click="home">hardstyle.gg Dashboard</a>
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

    <div class="w-full text-center" v-if="pending">
      <span class="loading loading-spinner loading-xl mt-5"></span>
    </div>
    <div class="w-full text-center" v-else-if="error">
      <div role="alert" class="alert alert-error alert-outline">
        <span>Failed to load dashboard data, please try again!</span>
      </div>
    </div>
    <div class="w-full" v-else-if="data">
      <div class="flex">
        <DashboardMenu :dashboardData="data" />

        <div class="w-full bg-base-100 p-2 lg:p-7">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>