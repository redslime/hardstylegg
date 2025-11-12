<script setup lang="ts">
import {computed} from 'vue'
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import {GameState} from "~/types/models";
import type {TimetableContainer, TimetableItem} from "~/types/gameModels";
import {countItem} from "~/utils/game";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<TimetableContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const items = ref<TimetableItem[]>(props.container.items)

const validateGuess = (item: TimetableItem) => {
  if (!item.guess) {
    item.correct = null
    return
  }
  item.correct = item.guess.trim().toLowerCase() === item.name.toLowerCase()

  if(item.correct) {
    countItem(item.id, true)
  }

  if(items.value.filter(i => i.hidden).length === items.value.filter(i => i.correct === true).length) {
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

  <TimetableGenerator :container="props.container" :items="items">
    <template #default="{ item }">
      <div class="text-lg font-bold">
        <template v-if="!finished && item.hidden && !item.correct">
          <input
              v-model="item.guess"
              type="text"
              class="input input-xs md:input-sm ring-1 w-full"
              @input="validateGuess(item)"
              :class="{'input-error': item.correct === false}"
              :style="{backgroundColor: props.container.color_bg}"
          />
        </template>

        <template v-else>
          {{ item.name }}
        </template>
      </div>
      <div class="text-xs opacity-80">
        {{ item.begin }} - {{ item.end }}
      </div>
    </template>
  </TimetableGenerator>
</template>

<style scoped>

</style>
