<script setup lang="ts">

import {useAsyncData} from "#app";
import {getDashboardLists} from "~/utils/dashboard";
import ListEditor from "~/components/dashboard/list/ListEditor.vue";
import type {List} from "~/types/models";
import {deepCopy} from "~/utils/utils";
import {remapList} from "~/types/content";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const route = useRoute()
const id = computed<number>(() => Number(route.params.id))
const { data: lists, pending } = await useAsyncData("lists", () => getDashboardLists(), { lazy: true })

const list = ref<List | undefined>()

watch(lists, (newLists) => {
  if (newLists && !list.value) {
    list.value = remapList(deepCopy(newLists.find(l => l.id === id.value)))
  }
}, { immediate: true })
</script>

<template>
  <div class="flex gap-3" v-if="pending">
    <div class="loading loading-spinner loading-lg"></div>
    Loading list...
  </div>

  <ListEditor v-model:list="list" v-if="list" />
</template>

<style scoped>

</style>