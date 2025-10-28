<script setup lang="ts">
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import {GameState} from "~/types/models";
import {shuffleArray} from "~/utils/utils";
import type {QuizAnswer, QuizContainer} from "~/types/gameModels";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  container: { type: Object as PropType<QuizContainer>, required: true }
})

const state = computed(() => props.state)
const title = computed(() => props.container.title)
const answers = ref<QuizAnswer[]>(shuffleArray(props.container.items))
const correctAnswers = answers.value.filter(a => a.correct).length
const answered = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const selected = ref<QuizAnswer[]>([])

const click = (answer: QuizAnswer) => {
  if(state.value == GameState.PLAYING) {
    if(answer.correct) {
      if(correctAnswers > 1) { // multiple choice!
        if(!selected.value.includes(answer)) {
          selected.value.push(answer)
        }

        if(correctAnswers === selected.value.length) {
          emit("onFinish", GameState.SUCCEEDED)
        }
      } else {
        emit("onFinish", GameState.SUCCEEDED)
      }
    } else {
      emit("onFinish", GameState.FAILED)
    }
  }
}
</script>

<template>
  <GameTitle>
    <template #icon>
      <CheckCircle />
    </template>
    <template #title>
      {{ title }}
    </template>
  </GameTitle>

  <div class="flex flex-wrap gap-4 w-full">
    <div v-for="answer in answers" :key="answer.text"
         class="flex items-center justify-center rounded-md p-2 text-md font-semibold whitespace-nowrap grow basis-1/2 min-w-max
                sm:flex-1 pointer-coarse:p-4"
         :class="{'text-base-content bg-transparent hover:bg-base-100/50 cursor-pointer ring-1 ring-base-content/20': !answered && !selected.includes(answer),
                  'cursor-default': answered,
                  'text-base-content bg-transparent ring-2 ring-success': !answered && selected.includes(answer),
                  'text-success-content bg-success ring-0': answered && answer.correct,
                  'text-error-content bg-error ring-0': answered && !answer.correct}"
        @click="click(answer)">
      {{ answer.text }}
    </div>
  </div>
</template>

<style scoped>

</style>