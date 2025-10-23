<script setup lang="ts">
import ListBullet from "~/components/icons/game/ListBullet.vue";
import {GameState, type ShallowTrack, type Track} from "~/types/models";

export interface NameXContainer {
  goal: number
  title: string
  items: Track[]
}

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  container: { type: Object as PropType<NameXContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const goal = computed(() => props.container.goal)
const title = computed(() => props.container.title)
const items = ref<{track: Track, guessed: boolean}[]>(
    props.container.items.map(item => ({
      track: item,
      guessed: false
    }))
)
const guessed = computed(() => items.value.filter(i => i.guessed).length)

function validate(selected: ShallowTrack, flashError: () => void, flashSuccess: () => void, clear: () => void) {
  let success = false;

  for(const [_, item] of Object.entries(items.value)) {
    if(selected.sid === item.track.sid) {
      item.guessed = true;
      success = true;
    }
  }

  if(success) {
    clear()

    if(guessed.value >= goal.value) {
      emit("onFinish", GameState.SUCCEEDED)
    }

    flashSuccess()
  } else {
    clear()
    flashError()
  }
}

function censor(text: string, guessed: boolean): string {
  if(guessed)
    return text
  return "".padEnd(text.length, "*")
}
</script>

<template>
  <GameTitle>
    <template #icon>
      <ListBullet />
    </template>
    <template #title>
      {{ title }}
    </template>
  </GameTitle>

  <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
    <li
        v-for="(item, index) in items"
        :key="item.track.sid"
        class="flex items-center gap-3 py-2 px-3"
    >
      <div class="text-xl tabular-nums font-mono w-6"
          :class="{
            'opacity-30': !item.guessed,
            'text-success': item.guessed
          }">
        {{ index + 1 }}
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-2 font-semibold">
          <div :class="{'blur-sm': !item.guessed && guessed < goal && !finished}">
            {{ censor(item.track.title, item.guessed) }}
          </div>
        </div>

        <div class="text-xs opacity-60">
          <div :class="{'blur-sm': !item.guessed && guessed < goal && !finished}">
            {{ censor(item.track.artists, item.guessed) }}
          </div>
        </div>
      </div>
    </li>
  </ul>

  <div class="mt-8 w-2/3" v-if="!finished">
    <TrackInput
        @on-track-selected="validate"
        v-slot="{ inputBindings, inputEvents, errorFlash, successFlash }"
    >
      <label
          class="w-full input focus-within:outline-none focus-within:ring-0"
          :class="{
        'border-error': errorFlash,
        'border-success': successFlash
      }"
      >
        <input
            v-bind="inputBindings"
            v-on="inputEvents"
            type="text"
        />
        <span
            class="badge badge-neutral"
            :class="{'badge-success': guessed >= goal}"
        >
        {{ Math.min(goal, guessed) }}/{{ goal }}
      </span>
      </label>
    </TrackInput>
  </div>
</template>

<style scoped>
</style>