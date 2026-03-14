<script setup lang="ts">
import type {ArtworkContainer} from "~/types/gameModels";
import {getLocalArtwork} from "~/utils/utils";
import {GameState} from "~/types/models";
import TrackListenButton from "~/components/TrackListenButton.vue";
import {countAttempt} from "~/utils/game";
import {FlatTrack} from "~/types/content";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ArtworkDef
const emit = defineEmits(['onFinish'])
const details = inject<boolean>('details')
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<ArtworkContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const track = computed<FlatTrack>(() => FlatTrack.fromJson(props.container.track))
const currentIndex = inject<number>('currentIndex')

const src = computed(() => {
  if(finished.value) {
    return track.value.getImageUrl()
  } else {
    return props.container.img64 ?? getLocalArtwork(props.container.imgName)
  }
})

async function validate(selected: FlatTrack, flashError: () => void, flashSuccess: () => void, clear: () => void) {
  countAttempt()

  if(selected.sid === track.value.sid) {
    flashSuccess()
    emit("onFinish", GameState.SUCCEEDED)
  } else {
    flashError()
    clear()
  }
}
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <div class="flex items-center justify-center flex-col w-full">
    <img
        :src="src"
        alt="blank artwork"
        class="w-2/3 rounded-xl shadow-md mb-8"
    />
    <div v-if="finished">
      <p class="font-bold text-center"
        :class="{
          'text-xl md:text-3xl': !details,
          'text-xl': details
        }">
        {{ track.getDisplayName() }}
      </p>
      <div class="mt-4 text-center" v-if="currentIndex === props.position">
        <TrackListenButton :track="track" />
      </div>
    </div>
    <div class="flex w-full justify-center items-center" v-else>
      <BaseTrackInput class="w-2/3" @onSelected="validate" />
    </div>
  </div>
</template>

<style scoped>

</style>