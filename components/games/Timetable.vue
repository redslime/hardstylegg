<script setup lang="ts">
import {computed} from 'vue'
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import {GameState} from "~/types/models";
import type {TimetableContainer, TimetableItem} from "~/types/gameModels";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<TimetableContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const title = computed(() => props.container.title)
const items = computed<TimetableItem[]>(() => props.container.items)
const colorBg = computed(() => props.container.color_bg)
const colorText = computed(() => props.container.color_text)

// IMPAQT MAINSTAGE (THE COLOSSUS) kinda bricks the timetable... todo
// const items = ref<Item[]>([
//   {name: "Primeshock", begin: "14:00", end: "15:00", hidden:false },
//   {name: "KELTEK", begin: "15:00", end: "16:00", hidden:false },
//   {name: "Atomzfears & Sound Rush 2//\\1", begin: "16:00", end: "16:30", hidden:false },
//   {name: "Noisecontrollers & Devin Wild", begin: "16:30", end: "17:30", hidden:false },
//   {name: "Wildstylez", begin: "17:30", end: "18:30", hidden:false },
//   {name: "Sefa & Rooler", begin: "18:30", end: "19:00", hidden:false },
//   {name: "Zatox", begin: "19:00", end: "20:00", hidden:false },
//   {name: "Phuture Noize", begin: "20:00", end: "21:00", hidden:false },
//   {name: "D-Block & S-te-Fan", begin: "21:00", end: "22:00", hidden:false },
//   {name: "Ran-D", begin: "22:00", end: "23:00", hidden:false },
//   {name: "Warface", begin: "23:00", end: "0:00", hidden:false },
//   {name: "Rebelion", begin: "0:00", end: "1:00", hidden:false },
//   {name: "Miss K8", begin: "1:00", end: "2:00", hidden:false }
// ])

// 📏 Einstellungen
const hourHeight = 120
const blockGap = 8 // Abstand zwischen Blöcken (px)

// ⏱ Hilfsfunktionen
const getMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h!! * 60 + m!!
}

const startTime = computed(() => {
  const min = Math.min(...items.value.map(i => getMinutes(i.begin)))
  return `${Math.floor(min / 60)}:00`
})
const endTime = computed(() => {
  const max = Math.max(...items.value.map(i => getMinutes(i.end)))
  return `${Math.ceil(max / 60)}:00`
})

const hours = computed(() => {
  const start = Number(startTime.value.split(':')[0])
  const end = Number(endTime.value.split(':')[0])
  const arr = []
  for (let h = start; h <= end; h++) {
    arr.push(h.toString().padStart(2, '0'))
  }
  return arr
})

const validateGuess = (item: TimetableItem) => {
  if (!item.guess) {
    item.correct = null
    return
  }
  item.correct = item.guess.trim().toLowerCase() === item.name.toLowerCase()

  if(items.value.filter(i => i.hidden === true).length === items.value.filter(i => i.correct === true).length) {
    emit('onFinish', GameState.SUCCEEDED)
  }
}
</script>

<template>
  <GameTitle>
    <template #icon>
      <PencilSquare />
    </template>
    <template #title>
      Complete the timetable:
    </template>
  </GameTitle>

  <div class="w-full flex flex-col items-center justify-center">
    <div class="text-xl text-base-content/80 mb-2">{{ title }}</div>

    <div class="flex items-center justify-center w-3/5">
      <div class="relative border-l border-base-300">
        <div
            v-for="hour in hours"
            :key="hour"
            class="relative flex -left-15"
            :style="{ height: hourHeight + 'px' }"
        >
        <span class="absolute -left-14 text-sm text-base-content/70">
          {{ hour }}:00
        </span>
          <div class="w-full border-t border-base-200"></div>
        </div>

        <div
            v-for="item in items"
            :key="item.name"
            class="absolute left-0 right-0 rounded-lg shadow-md px-3 py-1"
            :style="{
            backgroundColor: '#' + colorBg,
            color: '#' + colorText,
            top: ((getMinutes(item.begin) - getMinutes(startTime)) / 60) * hourHeight + 'px',
            height: (getMinutes(item.end) - getMinutes(item.begin)) / 60 * hourHeight - blockGap + 'px',
            marginTop: blockGap / 2 + 'px',
            marginBottom: blockGap / 2 + 'px'
        }"
        >
          <div class="text-lg font-bold">
            <template v-if="!finished && item.hidden && !item.correct">
              <input
                  v-model="item.guess"
                  type="text"
                  class="input input-xs md:input-sm ring-1 w-full focus:outline-none focus:ring-0"
                  @input="validateGuess(item)"
                  :class="{'input-error': item.correct === false}"
                  :style="{
                  backgroundColor: '#' + colorBg
                }"
              />
            </template>

            <template v-else>
              {{ item.name }}
            </template>
          </div>
          <div class="text-xs opacity-80">
            {{ item.begin }} - {{ item.end }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relative {
  width: 100%;
  max-width: 60%;
  margin: 0 auto;
}
</style>
