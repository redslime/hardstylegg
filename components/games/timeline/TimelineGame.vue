<script setup lang="ts">
import {ref} from 'vue'
import {GameState} from "~/types/models";
import type {TimelineContainer} from "~/types/gameModels";
import {countOption} from "~/utils/game";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimelineDef

const minYear = 2000
const maxYear = 2025

const isMobile = inject<boolean>('isMobile')
const emit = defineEmits<{ onFinish: [state: GameState] }>()
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<TimelineContainer>, required: true }
})
watch(() => props.state, state => {
  if(state == GameState.SUCCEEDED || state == GameState.FAILED) {
    selectedYear.value = goal.value
  }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const goal = computed(() => props.container.goal)

// Default to the midpoint year for demonstration
const selectedYear = ref<number>(Math.floor((minYear + maxYear) / 2))

const thumbColor = computed(() => {
  switch(state.value) {
    case GameState.SUCCEEDED:
      return "var(--color-success)"
    case GameState.FAILED:
      return "var(--color-error)"
    default:
      return "var(--color-accent"
  }
})

// Allow mouse wheel to adjust the slider year up/down
const onWheel = (e: WheelEvent) => {
  // prevent page scroll while hovering the slider
  e.preventDefault()

  if(finished.value)
    return

  const step = e.shiftKey ? 5 : 1
  if (e.deltaY > 0) {
    // scrolling down -> next years
    selectedYear.value = Math.min(maxYear, selectedYear.value + step)
  } else if (e.deltaY < 0) {
    // scrolling up -> previous years
    selectedYear.value = Math.max(minYear, selectedYear.value - step)
  }
}

function submit() {
  countOption(Math.abs(selectedYear.value - goal.value))
  emit("onFinish", selectedYear.value == goal.value ? GameState.SUCCEEDED : GameState.FAILED)
}
</script>

<template>
  <div class="w-full">
    <GameTitle :gameDef="gameDef" :container="props.container" />

    <div class="flex flex-col items-center" @wheel.prevent="onWheel">
      <div class="flex flex-wrap gap-4 w-50 mb-2 place-items-center justify-center">
        <div class="font-light text-base-content/70" v-if="selectedYear>2000">
          {{ Math.max(2000, selectedYear-1) }}
        </div>
        <div class="text-xl md:text-3xl font-bold">
          {{ selectedYear }}
        </div>
        <div class="font-light text-base-content/70" v-if="selectedYear<2025">
          {{ Math.min(2025, selectedYear+1) }}
        </div>
      </div>

      <div class="w-4/5 md:w-2/3">
        <input
            v-model.number="selectedYear"
            type="range"
            :min="minYear"
            :max="maxYear"
            step="1"
            list="years-list"
            class="slider mb-5"
            aria-label="Year selector"
            :aria-valuemin="minYear"
            :aria-valuemax="maxYear"
            :aria-valuenow="selectedYear"
            :disabled="finished"
            :style="{'--thumb-color': thumbColor}"
        />
      </div>
    </div>

    <Teleport to="#side-dock" :disabled="!isMobile">
      <div class="text-center" v-if="!finished">
        <button class="btn btn-outline btn-primary btn-lg" @click="submit">Submit</button>
      </div>
    </Teleport>
  </div>
</template>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;
  background: var(--color-base-100);
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: pointer;
}
</style>