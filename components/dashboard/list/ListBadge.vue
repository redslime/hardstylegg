<script setup lang="ts">
import type {List} from "~/types/models";
import ListIcon from "~/components/dashboard/list/ListIcon.vue";

const { list, clickable } = defineProps({
  list: { type: Object as PropType<List>, required: true },
  clickable: { type: Boolean, default: true },
})
const url = computed<string | undefined>(() => clickable ? `/admin/list/${list.id}` : undefined)
</script>

<template>
  <div class="border border-secondary bg-secondary/15 rounded-md p-1 text-sm font-semibold">
    <NuxtLink class="flex gap-1 items-center" :to="url">
      <ListIcon :list="list" class="text-primary size-5" />
      {{ list.name }}
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>