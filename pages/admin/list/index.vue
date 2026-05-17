<script setup lang="ts">
import ListNumberedIcon from "~/components/icons/ListNumberedIcon.vue";
import {useAsyncData} from "#app";
import {getDashboardData, getDashboardLists} from "~/utils/dashboard";
import type {List} from "~/types/models";
import {icons} from "~/components/icons";
import SquaresIcon from "~/components/icons/SquaresIcon.vue";
import ListBulletIcon from "~/components/icons/ListBulletIcon.vue";
import {uiState} from "~/utils/store";
import {distinct} from "~/utils/utils";
import ListIcon from "~/components/dashboard/list/ListIcon.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const dashboardData = await getDashboardData()
const { data: lists, pending } = await useAsyncData("lists", () => getDashboardLists(), { lazy: true })
const filteredLists = computed<List[]>(() => {
  if(filter.value === "all") {
    return lists.value ?? []
  } else {
    return lists.value?.filter(l => filter.value === l.icon) ?? []
  }
})

const filterOptions = computed<string[]>(() => distinct(lists.value?.map(l => l.icon ?? 'ListNumberedIcon') ?? []))
const filter = ref<string>("all")

function getCreatorName(list: List): string {
  return dashboardData.editors.find(e => e.id === list.createdBy)?.name ?? "Unknown"
}

function setFilter(input: string) {
  filter.value = input;
  (document.activeElement as HTMLElement)?.blur()
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-4">
    <span class="text-primary"><ListNumberedIcon class="size-8" /></span>
    Lists
    <div v-if="lists" class="badge badge-soft badge-primary badge-xl">{{ lists.length }}</div>
    <NuxtLink to="/admin/list/create">
      <button class="btn btn-success btn-soft btn-sm ml-2 -mt-3">
        Add
      </button>
    </NuxtLink>
  </div>

  <div class="text-lg opacity-90 mb-3">
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

  <div class="flex gap-4 mb-8">
    <fieldset class="fieldset min-w-30">
      <legend class="fieldset-legend">View</legend>

      <div class="flex gap-2">
        <button class="btn btn-primary" :class="{'btn-outline': uiState.compact}" @click="uiState.compact = false">
          <SquaresIcon class="size-4" />
          Full
        </button>
        <button class="btn btn-primary" :class="{'btn-outline': !uiState.compact}" @click="uiState.compact = true">
          <ListBulletIcon class="size-4" />
          List
        </button>
      </div>
    </fieldset>

    <fieldset class="fieldset min-w-30">
      <legend class="fieldset-legend">Filter</legend>
      <div class="dropdown">
        <div tabindex="0" role="button" class="select cursor-pointer">
          <span class="capitalize">{{ filter }}</span>
        </div>
        <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-10 w-52 p-2 shadow-sm">
          <li @click="setFilter('all')"><a>All</a></li>
          <li v-for="filter in filterOptions" :key="filter" @click="setFilter(filter)">
            <a>
              <component :is="icons[filter]" class="text-primary size-6 object-cover" />
              <span class="capitalize">{{ filter }}</span>
            </a>
          </li>
        </ul>
      </div>
    </fieldset>
  </div>

  <div class="flex gap-3" v-if="pending">
    <div class="loading loading-spinner loading-lg"></div>
    Loading lists...
  </div>

  <div class="flex flex-col gap-4" v-else>
    <template v-if="!uiState.compact">
      <template v-for="list in filteredLists" :key="list.id">
        <div class="bg-base-200/50 p-4 rounded-md border border-white/10 hover:border-primary transition-colors cursor-pointer w-fit max-w-3xl"
             @click="navigateTo(`/admin/list/${list.id}`)">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <ListIcon :list="list" class="text-primary size-6" />
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

            <div class="flex gap-3 overflow-x-auto mt-3">
              <div v-for="item in list.items" :key="item.index">
                <img :src="item.item.getImageUrl()" class="size-16 object-cover max-w-none" :alt="item.item.getDisplayName()"
                     :class="{'rounded-full': list.type === 'artist', 'rounded-md': list.type !== 'artist'}" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <div class="max-w-5xl">
        <table class="table table-sm">
          <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
          </thead>
          <tbody>
            <template v-for="list in filteredLists" :key="list.id">
              <tr class="hover:bg-base-200/80 cursor-pointer" @click="navigateTo(`/admin/list/${list.id}`)">
                <th><ListIcon :list="list" class="text-primary size-6" /></th>
                <td><b>{{ list.name }}</b><br>by {{ getCreatorName(list) }}</td>
                <td>{{ list.items.length }} {{ list.type }}s</td>
                <td class="max-w-xl">
                  <div class="flex gap-3 overflow-x-auto mt-3">
                    <div v-for="item in list.items" :key="item.index">
                      <img :src="item.item.getImageUrl()" class="size-8 object-cover max-w-none" :alt="item.item.getDisplayName()"
                           :class="{'rounded-full': list.type === 'artist', 'rounded-md': list.type !== 'artist'}" />
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>