<script setup lang="ts">
import {GameState} from "~/types/models";
import type {MapContainer} from "~/types/gameModels";
import CountryMap from "~/components/games/map/CountryMap.vue";
import type {HighlightMapItem} from "~/utils/game/impl/ClientMapGame";
import BeneluxMap from "~/components/games/map/BeneluxMap.vue";

const { $gameRegistry } = useNuxtApp();
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

const map = useTemplateRef('map')
const current = ref<HighlightMapItem | undefined>()
const interact = ref(true)
const goalName = computed(() => gameDef.getGoalName(props.container))
const selectedName = computed<string | undefined>(() => current.value?.displayName())

function clicked(item: HighlightMapItem) {
  current.value = item
}

async function submit() {
  emit("onFinish", current.value?.validate(props.container) ? GameState.SUCCEEDED : GameState.FAILED)
  await nextTick()

  interact.value = false
  map.value?.solve(props.container)
}

watch(() => props.state, val => {
  if(val == GameState.SUCCEEDED || val == GameState.FAILED) {
    interact.value = false
    map.value?.solve(props.container)
  }
})
</script>

<template>
  <GameTitle :gameDef="gameDef" :container="props.container" />

  <CountryMap ref="map" :interact="interact" @click="s => clicked(s)" v-if="props.container.type === 'countries'">
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

  <BeneluxMap ref="map" :interact="interact" @click="s => clicked(s)" v-if="props.container.type === 'events'">
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
  </BeneluxMap>
</template>

<style scoped>

</style>