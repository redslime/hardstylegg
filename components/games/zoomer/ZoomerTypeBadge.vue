<script setup lang="ts">
import type {ZoomerType} from "~/types/zoomerModels";
import {capitalize} from "~/utils/utils";

const { type, style = "badge-info badge-soft" } = defineProps<{
  type: ZoomerType,
  style?: string
}>()
const badgeStyle = computed(() => [style])
</script>

<template>
<div class="flex gap-3">
  <template v-if="type.id === 'artist'">
    <div class="badge" :class="badgeStyle">Artist: {{ type.instance.name }}</div>
  </template>
  <template v-if="type.id === 'festival'">
    <div class="badge" :class="badgeStyle">{{ type.name }} {{ type.years }}</div>
    <div class="badge" :class="badgeStyle" v-for="[k, v] of Object.entries(type.fields!!)">{{ capitalize(k) }}: {{ v }}</div>
  </template>
</div>
</template>

<style scoped>

</style>