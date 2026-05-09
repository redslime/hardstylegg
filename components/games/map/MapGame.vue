<script setup lang="ts">
import {GameState} from "~/types/models";
import type {MapContainer} from "~/types/gameModels";
import CountryMap, {type HighlightItem} from "~/components/games/map/CountryMap.vue";

const { $gameRegistry, $countries } = useNuxtApp();
const gameDef = $gameRegistry.MapDef
const emit = defineEmits<{ onFinish: [state: GameState] }>()
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<MapContainer>, required: true }
})
const isMobile = inject<boolean>('isMobile')
const currentIndex = inject<number>('currentIndex')
const summary = inject<boolean>("summary", false)
const details = inject<boolean>("details", false)
const finished = computed(() => props.state == GameState.SUCCEEDED || props.state == GameState.FAILED)
const selected = ref<HighlightItem[]>([])
const current = ref<string | undefined>()
const interact = ref(true)
const goalName = computed(() => $countries.getName(props.container.goal, "en"))
const selectedName = computed(() => current.value ? $countries.getName(current.value, "en") : "")

async function clicked(country: string) {
  current.value = country
  selected.value = [
    {
      iso2: country,
      color: "#3ABDF8",
    }
  ]
}

async function submit() {
  emit("onFinish", current.value === props.container.goal ? GameState.SUCCEEDED : GameState.FAILED)
  await nextTick()

  interact.value = false
  selected.value = [
    {
      iso2: current.value!!,
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
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <CountryMap v-model:highlighted="selected" :interact="interact" @click="s => clicked(s)">
    <div class="absolute bottom-2 flex justify-center w-full z-500">
      <Teleport to="#side-dock" :disabled="!isMobile">
        <button class="btn btn-primary btn-lg btn-outline" @click="submit()" v-if="!finished && current">Submit</button>
      </Teleport>

      <template v-if="finished">
        <div class="flex gap-2">
          <Teleport to="#top-dock" :disabled="!isMobile || props.position !== currentIndex || summary || details">
            <div class="flex justify-center w-full gap-2">
              <div class="badge badge-lg badge-success">Correct: {{ goalName }}</div>
              <div v-if="props.state === GameState.FAILED" class="badge badge-lg badge-error">Selected: {{ selectedName }}</div>
            </div>
          </Teleport>
        </div>
      </template>
    </div>
  </CountryMap>
</template>

<style scoped>

</style>