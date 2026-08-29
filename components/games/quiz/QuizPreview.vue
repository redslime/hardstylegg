<script setup lang="ts">
import type {QuizContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.QuizDef
const { instance, pointer = true } = defineProps<{
  instance: QuizContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
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