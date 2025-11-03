<script setup lang="ts">
import type {QuizContainer} from "~/types/gameModels";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<QuizContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :typeId="7" :pointer="pointer" :container="instance" :title="instance.title">
    <div v-for="item in instance.items" :key="item.id" class="badge badge-outline"
         :class="{
                'badge-success': item.correct,
                'badge-error': !item.correct
              }">
      {{ item.text }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>