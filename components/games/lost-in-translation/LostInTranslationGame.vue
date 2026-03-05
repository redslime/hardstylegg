<script setup lang="ts">
import {GameState, type ShallowTrack} from "~/types/models";
import type {LostInTranslationContainer} from "~/types/gameModels";
import {getName} from "~/utils/tracks";
import {countAttempt} from "~/utils/game";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.LostInTranslationDef
const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<LostInTranslationContainer>, required: true }
})
const currentIndex = inject<number>('currentIndex')
const finished = computed(() => props.state == GameState.SUCCEEDED || props.state == GameState.FAILED)
const showTranslated = ref<boolean>(true)

async function validate(selected: ShallowTrack, flashError: () => void, flashSuccess: () => void, clear: () => void) {
  countAttempt()

  if(selected.sid === props.container.track.sid) {
    flashSuccess()
    emit("onFinish", GameState.SUCCEEDED)
  } else {
    flashError()
    clear()
  }
}

watch(finished, () => showTranslated.value = false)
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <div class="flex flex-col items-center w-full">
    <div class="text-2xl md:text-3xl text-center mb-4 text-balance" v-if="finished">{{ getName(props.container.track) }}</div>
    <div role="tablist" class="tabs tabs-lift" v-if="finished">
      <a role="tab" class="tab" :class="{'tab-active font-semibold': showTranslated }" @click="showTranslated = true">Translation</a>
      <a role="tab" class="tab" :class="{'tab-active font-semibold': !showTranslated }" @click="showTranslated = false">Original</a>
    </div>
    <div>
      <div class="bg-base-300 p-3 text-center whitespace-pre-wrap rounded-lg">
        <div class="space-y-2">
          <template v-if="showTranslated">
            {{ props.container.textTranslated }}
          </template>
          <template v-else>
            {{ props.container.textOriginal }}
          </template>
        </div>
      </div>
    </div>

    <div class="mt-5 text-center" v-if="finished">
      <p class="font-semibold text-xl">Translation chain:</p>
      <p class="text-base-content/90">{{ props.container.translationChain }}</p>
    </div>

    <div class="flex w-full justify-center items-center mt-5" v-if="!finished">
      <TrackInput class="w-2/3" @onTrackSelected="validate" />
    </div>

    <div class="mt-4" v-if="finished && currentIndex === props.position">
      <TrackListenButton :track="props.container?.track" />
    </div>
  </div>
</template>

<style scoped>

</style>