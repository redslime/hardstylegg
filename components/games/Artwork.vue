<script setup lang="ts">
import {GameState, type ShallowTrack, type Track} from "~/types/models";
import Pencil from "~/components/icons/game/Pencil.vue";
import {getLocalArtwork, getSpotifyArtwork} from "~/utils/utils";
import SpotifyButton from "~/components/SpotifyButton.vue";
import type {ArtworkContainer} from "~/types/gameModels";
import {countAttempt} from "~/utils/game";

const emit = defineEmits(['onFinish'])
const details = inject<boolean>('details')
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<ArtworkContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const track = computed<Track>(() => props.container.track)
const artworkBlank = computed(() => props.container.artwork_blank)
const currentIndex = inject<number>('currentIndex')

const src = computed(() => {
  if(finished.value) {
    return getSpotifyArtwork(track.value.cover_art)
  } else {
    return getLocalArtwork(artworkBlank.value)
  }
})

async function validate(selected: ShallowTrack, flashError: () => void, flashSuccess: () => void, clear: () => void) {
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
  <GameTitle>
    <template #icon>
      <Pencil />
    </template>
    <template #title>
      Which track does this artwork belong to?
    </template>
  </GameTitle>

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
        {{ track.artists }} - {{ track.title }}
      </p>
      <div class="mt-4 text-center" v-if="currentIndex === props.position">
        <SpotifyButton :track="track" />
      </div>
    </div>
    <div class="flex w-full justify-center items-center" v-else>
      <TrackInput class="w-2/3" @onTrackSelected="validate" />
    </div>
  </div>
</template>

<style scoped>

</style>