<script setup lang="ts">
import {GameState} from "~/types/models";
import type {CompleteAlbumContainer, CompleteAlbumItem} from "~/types/gameModels";
import {countItem} from "~/utils/game";
import {CompleteAlbumDef} from "~/utils/game/clientGameRegistry";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<CompleteAlbumContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const items = computed(() => props.container.items)
const currentIndex = inject<number>('currentIndex')

const validateGuess = (item: CompleteAlbumItem) => {
  if (!item.guess) {
    item.correct = null
    return
  }

  item.correct = item.guess.trim().toLowerCase() === item.name.toLowerCase()

  if(item.correct) {
    countItem(item.id, item.correct)
  }

  if(items.value.filter(i => i.hidden === true).length === items.value.filter(i => i.correct === true).length) {
    emit('onFinish', GameState.SUCCEEDED)
  }
}
</script>

<template>
  <GameTitle :gameDef="CompleteAlbumDef" :container="props.container" />

  <div class="flex justify-center">
    <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
      <li
          v-for="(item, index) in items"
          :key="item.name"
          class="flex items-center gap-3 py-2 px-3"
      >
        <div class="text-xl tabular-nums font-mono w-6"
             :class="{
            'opacity-30': !item.hidden || (!finished && !item.correct),
            'text-error': finished && !item.correct && item.hidden,
            'text-success': item.correct
          }">
          {{ index + 1 }}
        </div>

        <div class="flex-1">
          <div class="font-semibold flex items-center gap-2">
            <template v-if="!finished && item.hidden && !item.correct">
              <input
                  v-model="item.guess"
                  type="text"
                  class="input input-xs w-full"
                  @input="validateGuess(item)"
                  :class="{'input-error': item.correct === false}"
              />
            </template>

            <template v-else>
              {{ item.name }}
            </template>
          </div>

          <div class="text-xs opacity-60">{{ item.artist }}</div>
        </div>
      </li>
    </ul>
  </div>

  <div class="mt-4 text-center" v-if="finished && props.container.album && currentIndex === props.position">
    <SpotifyButton :track="props.container.album" :isAlbum="true" />
  </div>
</template>


<style scoped>

</style>