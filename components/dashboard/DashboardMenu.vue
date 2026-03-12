<script setup lang="ts">
import {getIcon} from "~/utils/icons";
import type {DashboardData, DashboardItem} from "~/types/models";

const route = useRoute()
const { dashboardData } = defineProps({
  dashboardData: { type: Object as PropType<DashboardData>, required: true },
})

const groups = dashboardData.groups

const isActive = (url: string) => route.path === url || route.path === url + "/new"

const hasActiveChild = (item: DashboardItem): boolean => {
  if (!item.children?.length) return false
  return item.children.some((child) => isActive(child.url) || hasActiveChild(child))
}

const isItemActive = (item: DashboardItem): boolean => {
  return isActive(item.url) || hasActiveChild(item)
}
</script>

<template>
  <ul class="menu w-56 min-h-screen bg-base-300">
    <template v-for="group in groups" :key="group.name">
      <li class="menu-title">{{ group.name }}</li>

      <li v-for="item in group.items" :key="item.name">
        <NuxtLink
            :to="item.url"
            class="transition-colors duration-200"
            exact-active-class="menu-active text-primary"
            :class="{
              'menu-active': isItemActive(item),
              'text-primary': isItemActive(item)
            }"
        >
          <span class="text-primary">
            <component :is="getIcon(item.icon, group.name === 'Games')" />
          </span>
          {{ item.name }}
        </NuxtLink>

        <ul v-if="item.children?.length">
          <li v-for="child in item.children" :key="child.name">
            <NuxtLink
                :to="child.url"
                class="transition-colors duration-200"
                exact-active-class="menu-active text-primary"
                :class="{
                  'menu-active': isItemActive(child),
                  'text-primary': isItemActive(child)
                }"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </template>
  </ul>
</template>

<style scoped>
</style>