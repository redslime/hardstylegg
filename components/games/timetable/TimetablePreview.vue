<script setup lang="ts">
import type {TimetableContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimetableDef
const { instance, pointer = true } = defineProps<{
  instance: TimetableContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div v-for="item in instance.items" :key="item.id" class="badge badge-outline"
         :class="{'badge-info': item.hidden}">
      {{ item.name }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>