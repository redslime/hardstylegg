<script setup lang="ts">
import type {List} from "~/types/models";
import {icons} from "~/components/icons";

const { list } = defineProps<{
  list: List
}>()
</script>

<template>
  <component :is="icons[list.icon ?? 'ListNumberedIcon']" class="object-cover" />
</template>

<style scoped>

</style>