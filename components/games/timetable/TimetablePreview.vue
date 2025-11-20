<script setup lang="ts">
import type {TimetableContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimetableDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<TimetableContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
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