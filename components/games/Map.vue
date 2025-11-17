<script setup lang="ts">
import {GameState} from "~/types/models";
import type {MapContainer} from "~/types/gameModels";
import type {HighlightItem} from "~/components/CountryMap.vue";
import MapIcon from "~/components/icons/game/MapIcon.vue";

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<MapContainer>, required: true }
})

const selected = ref<HighlightItem[]>([])
const interact = ref(true)

async function clicked(country: string) {
  emit("onFinish", country === props.container.goal ? GameState.SUCCEEDED : GameState.FAILED)
  await nextTick()

  interact.value = false
  selected.value = [
    {
      iso2: country,
      color: "#FB7085",
    },
    {
      iso2: props.container.goal,
      color: "#2ED4BF",
    }
  ]
}

watch(() => props.state, val => {
  if(val == GameState.SUCCEEDED || val == GameState.FAILED) {
    interact.value = false
    selected.value = [
      {
        iso2: props.container.goal,
        color: "#2ED4BF",
      }
    ]
  }
})
</script>

<template>
  <GameTitle>
    <template #icon>
      <MapIcon />
    </template>
    <template #title>
      {{  props.container.title }}
    </template>
  </GameTitle>

  <CountryMap v-model:highlighted="selected" :interact="interact" @click="s => clicked(s)" />
</template>

<style scoped>

</style>