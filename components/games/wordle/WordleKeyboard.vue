<script setup lang="ts">
import {LetterState} from "~/utils/game/impl/ClientWordleGame";
import BackspaceIcon from "~/components/icons/BackspaceIcon.vue";

const { letterStates, ready } = defineProps({
  letterStates: { type: Object as PropType<Record<string, LetterState>>, required: true },
  ready: { type: Boolean, required: true }
})
const emit = defineEmits<{
  key: [key: string]
}>()

const isGerman = navigator.language.startsWith('de');
const top = isGerman ? 'qwertzuiop'.split('') : 'qwertyuiop'.split('')
const bottom = isGerman ? 'yxcvbnm'.split('') : 'zxcvbnm'.split('')
const rows = [
  top,
  'asdfghjkl-'.split(''),
  ['Enter', ...bottom, 'Backspace']
]

function press(key: string) {
  if(key === 'Enter' && !ready) {
    return
  }

  emit('key', key)
}
</script>

<template>
  <div id="keyboard" class="w-full sm:w-4/5 md:2/3">
    <div class="row" v-for="(row, i) in rows">
      <div class="spacer" v-if="i === 1"></div>
      <button
          v-for="key in row"
          :class="[key.length > 1 && 'big', letterStates[key]]"
          @click="press(key)"
      >
        <BackspaceIcon v-if="key === 'Backspace'" />

        <template v-else-if="key === 'Enter'">
          <span v-if="ready">ENTER</span>
          <div v-else class="loading loading-spinner"></div>
        </template>

        <span v-else>{{ key }}</span>
      </button>
      <div class="spacer" v-if="i === 1"></div>
    </div>
  </div>
</template>

<style scoped>
#keyboard {
  margin: 30px 8px 0;
  user-select: none;
}
.row {
  display: flex;
  width: 100%;
  margin: 0 auto 8px;
  touch-action: manipulation;
}
.spacer {
  flex: 0.5;
}
button {
  font-family: inherit;
  font-weight: bold;
  border: 0;
  padding: 0;
  margin: 0 6px 0 0;
  height: 58px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  background-color: #d3d6da;
  color: #1a1a1b;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);
  transition: all 0.2s 1.5s;
}
button:last-of-type {
  margin: 0;
}
button.big {
  flex: 1.5;
}

body {
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
  max-width: 500px;
  margin: 0px auto;
}

h1 {
  margin: 4px 0;
  font-size: 36px;
}

header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 30px;
  position: relative;
}

.correct,
.present,
.absent {
  color: #fff !important;
}

.correct {
  background-color: #6aaa64 !important;
}

.present {
  background-color: #c9b458 !important;
}

.absent {
  background-color: #787c7e !important;
}
</style>