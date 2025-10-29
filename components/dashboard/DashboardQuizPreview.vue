<script setup lang="ts">
import type {QuizContainer} from "~/types/gameModels";

const { quiz } = defineProps({
  quiz: { type: Object as PropType<QuizContainer>, required: true }
})
</script>

<template>
  <DashboardGamePreview :type-id="7" :container="quiz" :title="quiz.title">
    <div v-for="item in quiz.items" :key="item.id" class="badge badge-outline"
         :class="{
              'badge-success': item.correct,
              'badge-error': !item.correct
            }">
      {{ item.text }}
    </div>
  </DashboardGamePreview>
</template>

<style scoped>

</style>