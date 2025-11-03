<script setup lang="ts">
import type {TimetableContainer} from "~/types/gameModels";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<TimetableContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="9" :pointer="pointer" :container="instance" :title="instance.title">
    <div v-for="item in instance.items" :key="item.id" class="badge badge-outline"
         :class="{'badge-info': item.hidden}">
      {{ item.name }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>