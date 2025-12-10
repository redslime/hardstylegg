<script setup lang="ts">
import type {ZoomerType} from "~/types/zoomerModels";
import {capitalize} from "~/utils/utils";

const { type, outline, style } = defineProps({
  type: { type: Object as PropType<ZoomerType>, required: true },
  outline: { type: Boolean, required: false, default: false },
  style: { type: String, required: false, default: "badge-info" },
})
const badgeStyle = computed(() => {
  if(outline) {
    return ['badge-outline', style]
  } else {
    return ['badge-soft', style]
  }
})
</script>

<template>
<div class="flex gap-3">
  <template v-if="type.id === 'artist'">
    <div class="badge" :class="badgeStyle">Artist: {{ type.name }}</div>
  </template>
  <template v-if="type.id === 'festival'">
    <div class="badge" :class="badgeStyle">{{ type.name }} {{ type.years }}</div>
    <div class="badge" :class="badgeStyle" v-for="[k, v] of Object.entries(type.fields!!)">{{ capitalize(k) }}: {{ v }}</div>
  </template>
</div>
</template>

<style scoped>

</style>