<script setup lang="ts">
const { solution, guess } = defineProps({
  solution: { type: String, required: true },
  guess: { type: String, required: true }
})

const solutionLetters = computed<string[]>(() => solution.split(""))
const guessLetters = computed<string[]>(() => guess.split(""))

function getColor(guessLetter: string, solutionLetter: string) {
  if (guessLetter === solutionLetter) {
    return "bg-[#6aaa64]"
  } else if (solutionLetters.value.includes(guessLetter)) {
    return "bg-[#c9b458]"
  } else {
    return "bg-[#787c7e]"
  }
}
</script>

<template>
  <div class="flex gap-1">
    <div v-for="(letter, index) in guessLetters" class="w-8 h-8 text-xl rounded-sm text-center text-white uppercase font-bold"
      :class="getColor(letter, solutionLetters[index]!!)">
      {{ letter }}
    </div>
  </div>
</template>

<style scoped>

</style>