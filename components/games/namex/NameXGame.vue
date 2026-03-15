<script setup lang="ts">
import {GameState} from "~/types/models";
import type {NameXContainer} from "~/types/gameModels";
import {countAttempt, countItem} from "~/utils/game";
import {BaseTrack, FlatAlbum, FlatArtist, FlatTrack} from "~/types/content";
import BaseTrackInput from "~/components/BaseTrackInput.vue";
import TextInput from "~/components/TextInput.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NameXDef
const isMobile = inject<boolean>('isMobile')
const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<NameXContainer>, required: true }
})

const type = computed(() => props.container.items.type)
const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const goal = computed(() => props.container.goal)
const items = ref<{index: number, item: FlatArtist | FlatAlbum | FlatTrack | string, guessed: boolean}[]>(
    props.container.items.items.map((item, index) => ({
      index,
      item,
      guessed: false
    }))
)
const guessed = computed(() => items.value.filter(i => i.guessed).length)

function validateText(text: string, inputFeedback: (success: boolean) => boolean) {
  let success = false;
  countAttempt()

  for(const [_, item] of Object.entries(items.value)) {
    if (text.trim().toLowerCase() === (item.item as string).trim().toLowerCase()) {
      countItem(item.index, true)
      item.guessed = true;
      success = true;
    }
  }

  if(inputFeedback(success) && guessed.value >= goal.value) {
    emit("onFinish", GameState.SUCCEEDED)
  }
}

function validate(selected: FlatArtist | BaseTrack | string, inputFeedback: (success: boolean) => boolean) {
  let success = false;
  countAttempt()

  for(const [_, item] of Object.entries(items.value)) {
    if((item.item instanceof BaseTrack && selected instanceof BaseTrack && selected.sid === item.item.sid)
      || (item.item instanceof FlatArtist && selected instanceof FlatArtist && selected.id === item.item.id)
      || (item.item instanceof String && selected instanceof String && selected.trim().toLowerCase() === (item.item as string).trim().toLowerCase())) {
      countItem(item.index, true)
      item.guessed = true;
      success = true;
    }
  }

  if(inputFeedback(success) && guessed.value >= goal.value) {
    emit("onFinish", GameState.SUCCEEDED)
  }
}

function censor(text: string, censor: boolean): string {
  if(censor)
    return "".padEnd(text.length, "*")
  return text
}
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <ul class="grid bg-base-100 rounded-box shadow-md divide-y divide-base-300 text-sm"
      :class="{ 'grid-cols-2': items.length >= 6 && !isMobile, 'grid-cols-3': items.length >= 15 && !isMobile }">
    <li
        v-for="(item, index) in items"
        :key="index"
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
            <template v-if="item.item instanceof BaseTrack">
              {{ censor(item.item.title, !item.guessed && guessed < goal && !finished) }}
            </template>
            <template v-else-if="item.item instanceof FlatArtist">
              {{ censor(item.item.getDisplayName(), !item.guessed && guessed < goal && !finished) }}
            </template>
            <template v-else>
              {{ censor(item.item as string, !item.guessed && guessed < goal && !finished) }}
            </template>
          </div>
        </div>

        <div class="text-xs opacity-60" v-if="item.item instanceof BaseTrack">
          <div :class="{'blur-sm': !item.guessed && guessed < goal && !finished}">
            {{ censor(item.item.getArtistsString(), !item.guessed && guessed < goal && !finished) }}
          </div>
        </div>
      </div>
    </li>
  </ul>

  <div class="mt-8 w-2/3" v-if="!finished">
    <template v-if="type === 'artist'">
      <ArtistInput
        @onSelected="validate"
        v-slot="{ inputBindings, inputEvents, errorFlash, successFlash }"
        >
        <label
            class="w-full input"
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
      </ArtistInput>
    </template>

    <template v-else-if="type === 'album' || type === 'track'">
      <BaseTrackInput
        @onSelected="validate"
        :isAlbums="type === 'album'"
        :titleOnly="type === 'album'"
        v-slot="{ inputBindings, inputEvents, errorFlash, successFlash }"
        >
        <label
            class="w-full input"
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
      </BaseTrackInput>
    </template>

    <template v-else>
      <TextInput
          @onTextInput="validateText"
          v-slot="{ inputBindings, inputEvents, errorFlash, successFlash }"
      >
        <label
            class="w-full input"
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
      </TextInput>
    </template>
  </div>
</template>

<style scoped>
</style>