<script setup lang="ts">
import Checkmark from "~/components/icons/Checkmark.vue";
import Xmark from "~/components/icons/Xmark.vue";

const props = defineProps({
  step: { type: Number, required: true },
  action: { type: Function as PropType<(index: number) => void>, required: false },
  finished: { type: Boolean, default: false }
})
const step = computed(() => props.step)
const score = ref<State[]>([]);

function hasBg(index: number) {
  return score.value.length >= index || (step.value === index && !props.finished)
}

enum State {
  Checkmark,
  Cross
}

const stepSuccess = () => {
  score.value.push(State.Checkmark)
}

const stepFail = () => {
  score.value.push(State.Cross)
}

watch(step, (newStep) => {
  if(newStep === 1) {
    score.value = []
  }
})

defineExpose({
  stepSuccess,
  stepFail
})

</script>

<template>
  <ul class="flex justify-center steps steps-horizontal md:scale-130">
    <li class="step" v-for="index in 5" :key="index" :class="{ 'step-active': hasBg(index) }" @click="props.action?.(index)">
      <span class="step-icon step-active" v-if="step >= index+1 && score[index-1]==State.Checkmark"><Checkmark class="text-success" /></span>
      <span class="step-icon step-active" v-else-if="step >= index+1 && score[index-1]==State.Cross"><Xmark class="text-error" /></span>
      <span class="step-icon" v-else></span>
    </li>
  </ul>
</template>

<style scoped>
li.step::before, li.step::after {
  pointer-events: none;
}
.steps {
  .step {
    --step-bg: #222631;
    --step-fg: #222631;
  }
}
.steps {
  & .step-active {
    + .step-active:before, &:after, > .step-icon {
      --step-bg: #313b62;
      --step-fg: #313b62;
    }
  }
}
</style>