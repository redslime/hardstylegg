<script setup lang="ts">
import {getIcon} from "~/utils/icons";
import type {DashboardData} from "~/types/models";

const route = useRoute()
const dashboardData = await $fetch<DashboardData>('/api/dashboard')
const structure = dashboardData.groups
const isActive = (url: string) => route.path === url || route.path === url + "/new"
</script>

<template>
  <ul class="menu w-56 min-h-screen bg-base-300">
    <template v-for="group in structure" :key="group.name">
      <li class="menu-title">{{ group.name }}</li>
      <li v-for="item in group.items" :key="item.name">
        <NuxtLink :to="item.url" class="transition-colors duration-200" exact-active-class="menu-active text-primary"
                :class="{
                  'menu-active': isActive(item.url), 'text-primary': isActive(item.url)
                }"
        >
          <span class="text-primary">
            <component :is="getIcon(item.icon, group.name === 'Games')" />
          </span>
          {{ item.name }}
        </NuxtLink>
      </li>
    </template>
  </ul>
</template>

<style scoped>

</style>