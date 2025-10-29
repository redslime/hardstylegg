<script setup lang="ts">
import {computed, ref} from 'vue'
import Draggable from 'vuedraggable'
import {GameState} from "~/types/models";
import {shuffleArray} from "~/utils/utils";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import type {OrderContainer, OrderItem} from "~/types/gameModels";

const isMobile = inject<boolean>('isMobile')
const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<OrderContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const title = computed(() => props.container.title)
const showNames = computed(() => props.container.showNames)
const goalItems = computed(() => {
  const items: OrderItem[] = []

  for(let i = 0; i < props.container.items.length; i++) {
    items.push(props.container.items.find(item => item.index === i)!!)
  }

  return items
})
const items = ref<OrderItem[]>(shuffleArray(props.container.items))

function submit() {
  for(let i = 0; i < items.value.length; i++) {
    if(items.value[i]?.index !== i) {
      emit("onFinish", GameState.FAILED)
      return
    }
  }

  emit("onFinish", GameState.SUCCEEDED)
}

function isCorrect(item: OrderItem, index: number) {
  return finished.value && item.index === index
}

function isWrong(item: OrderItem, index: number) {
  return finished.value && item.index !== index
}
</script>

<template>
  <GameTitle>
    <template #icon>
      <ArrowsRightLeft />
    </template>
    <template #title>
      {{ title }}
    </template>
    <template #subtitle>
      <div class="text-center text-base mb-8 text-base-content/50">(Oldest to newest)</div>
    </template>
  </GameTitle>

  <div class="max-w-5xl mx-auto">
    <Draggable
        v-model="items"
        item-key="name"
        :animation="200"
        class="flex flex-wrap gap-4 overflow-x-auto md:p-4 flex-row"
        :component-data="{
          name: 'flip-list',
          tag: 'div',
         }"
        :disabled="finished"
    >
      <template #item="{ element, index }">
        <div
            :key="element.index"
            class="flex-1 flex-shrink active:cursor-grabbing transform transition-transform duration-300 ease-in-out"
            :class="{
              'cursor-grab': !finished
            }"
        >
          <img
              :src="`${getSpotifyArtwork(element.track.cover_art)}`"
              :alt="element.track.title"
              class="object-cover rounded-xl shadow-md"
              :class="{
                'md:hover:scale-105 transition-transform duration-200 ease-in-out': !finished,
                'border-1 border-success': isCorrect(element, index),
                'border-1 border-error': isWrong(element, index)
              }"
          />
        </div>
      </template>
    </Draggable>

    <div class="mt-3 text-center text-sm text-base-content/40" v-if="showNames && !finished">
      Current order:
      <span class="font-semibold text-base-content/45">
        {{ items.map(i => i.track.title).join(' → ') }}
      </span>
    </div>
    <Teleport to="#side-dock" :disabled="!isMobile">
      <div class="text-center" v-if="!finished">
        <button class="btn btn-outline btn-primary btn-lg" @click="submit">Submit</button>
      </div>
    </Teleport>

    <div class="mt-3" v-if="finished && state == GameState.FAILED">
      <div class="text-2xl text-center text-base-content text-bold">
        Correct order:
      </div>
      <div class="flex justify-center gap-4 overflow-x-auto md:p-4">
        <div v-for="item in goalItems" :key="item.index"
             class="flex-1 flex-shrink active:cursor-grabbing transform transition-transform duration-300 ease-in-out">
          <img
              :src="`${getSpotifyArtwork(item.track.cover_art)}`"
              :alt="item.track.title"
              class="object-cover rounded-xl shadow-md"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-list-move {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
