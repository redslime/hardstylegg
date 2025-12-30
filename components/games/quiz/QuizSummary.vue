<script setup lang="ts">
import type {QuizAnswer, QuizContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";

const { container, reports } = defineProps({
  container: { type: Object as PropType<QuizContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

function getAnswerShare(id: number): number {
  return Math.round(reports.filter(r => r.itemsClicked.includes(id)).length / reports.length * 100)
}

function getBackground(answer: QuizAnswer): string {
  const percentage = getAnswerShare(answer.id!!)
  const colorL = answer.correct ? "#2ED4BF" : "#FB7085"
  const colorR = answer.correct ? "rgba(46,212,191,0.7)" : "rgba(251,112,133,0.7)"
  return `linear-gradient(to right, ${colorL} ${percentage}%, ${colorR} ${percentage}%)`
}
</script>

<template>
  <div class="flex flex-wrap gap-4 w-fit justify-center">
    <template v-for="answer in container.items" :key="answer.text">
      <div class="flex items-center gap-2 min-w-40">
        <div class="flex items-center justify-center rounded-md p-2 text-md font-semibold whitespace-nowrap grow basis-1/2 min-w-max
                  sm:flex-1 pointer-coarse:p-4"
             :class="{'text-success-content bg-success ring-0': answer.correct,
                    'text-error-content bg-error ring-0': !answer.correct}"
             :style="{
                      background: getBackground(answer)}"
        >
          <div class="flex flex-col text-center">
            <div>
              {{ answer.text }}
              <span v-if="reports.length > 0">
                ({{ getAnswerShare(answer.id!!) }}%)
              </span>
            </div>

            <div class="text-sm font-normal" v-if="answer.context">
              {{ answer.context }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>