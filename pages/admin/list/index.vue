<script setup lang="ts">
import ListNumberedIcon from "~/components/icons/ListNumberedIcon.vue";
import {useAsyncData} from "#app";
import {getDashboardData, getDashboardLists} from "~/utils/dashboard";
import type {List} from "~/types/models";
import {icons} from "~/components/icons";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const dashboardData = await getDashboardData()
const { data: lists, pending } = await useAsyncData("lists", () => getDashboardLists(), { lazy: true })

function getCreatorName(list: List): string {
  return dashboardData.editors.find(e => e.id === list.createdBy)?.name ?? "Unknown"
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-4">
    <span class="text-primary"><ListNumberedIcon class="size-8" /></span>
    Lists
    <NuxtLink to="/admin/list/create">
      <button class="btn btn-success btn-soft btn-sm ml-2">
        Add
      </button>
    </NuxtLink>
  </div>

  <div class="text-lg opacity-90 mb-6">
    <p>
      Lists are meant to provide additional context and relationships between
      <span class="text-secondary">tracks</span>,
      <span class="text-secondary">albums</span>
      and
      <span class="text-secondary">artists</span>.
    </p>
    <p>
      They provide a resource for creating new games, and specifically can automatically generate content for <i class="font-semi opacity-60">upcoming game.</i>
    </p>
  </div>

  <div class="flex gap-3" v-if="pending">
    <div class="loading loading-spinner loading-lg"></div>
    Loading lists...
  </div>

  <div class="flex flex-col gap-4" v-else>
    <template v-for="list in lists" :key="list.id">
      <div class="bg-base-200/50 p-4 rounded-md border border-white/10 hover:border-primary transition-colors cursor-pointer w-fit"
           @click="navigateTo(`/admin/list/${list.id}`)">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <component :is="icons[list.icon ?? 'ListNumberedIcon']" class="text-primary size-6 object-cover" />
            <p class="text-xl font-bold">{{ list.name }}</p>
          </div>

          <div class="flex flex-wrap gap-1 -mt-1">
            <div class="badge badge-neutral badge-xs font-mono">ID: {{ list.id }}</div>
            <div class="badge badge-neutral badge-xs font-mono">
              Created by {{ getCreatorName(list) }}
            </div>
            <div class="badge badge-neutral badge-xs font-mono">{{ list.items.length }} {{ list.type }}s</div>
          </div>

          <div class="text-sm opacity-80 whitespace-pre-line" v-if="list.description">
            {{ list.description }}
          </div>

          <div class="flex gap-3 overflow-x-auto max-w-3xl mt-3">
            <div v-for="item in list.items" :key="item.index">
              <img :src="item.item.getImageUrl()" class="size-16 object-cover max-w-none" :alt="item.item.getDisplayName()"
                   :class="{'rounded-full': list.type === 'artist', 'rounded-md': list.type !== 'artist'}" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>