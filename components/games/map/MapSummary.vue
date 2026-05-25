<script setup lang="ts">
import {type GameReportFlat} from "~/types/models";
import type {MapContainer} from "~/types/gameModels";
import CountryMap from "~/components/games/map/CountryMap.vue";
import BeneluxMap from "~/components/games/map/BeneluxMap.vue";
import {type CountryHighlightMapItem, EventHighlightMapItem} from "~/utils/game/impl/ClientMapGame";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.MapDef
const { container, reports } = defineProps({
  container: { type: Object as PropType<MapContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
const goalName = computed(() => gameDef.getGoalName(container))
</script>

<template>
  <CountryMap :init="gameDef.getHighlightMapItem(container) as CountryHighlightMapItem"
              :interact="false" v-if="container.type === 'countries'">
    <div class="absolute bottom-2 flex justify-center w-full z-500">
      <div class="badge md:badge-lg badge-info" v-if="goalName">Selected: {{ goalName }}</div>
    </div>
  </CountryMap>

  <BeneluxMap :init="gameDef.getHighlightMapItem(container) as EventHighlightMapItem"
              :interact="false"  v-if="container.type === 'events'">
    <div class="absolute bottom-2 flex justify-center w-full z-500">
      <div class="badge md:badge-lg badge-info" v-if="goalName">Selected: {{ goalName }}</div>
    </div>
  </BeneluxMap>
</template>

<style scoped>

</style>