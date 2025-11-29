<script setup lang="ts">
import {type GameReportFlat, GameState} from "~/types/models";
import type {MapContainer} from "~/types/gameModels";
import CountryMap, {type HighlightItem} from "~/components/games/map/CountryMap.vue";

const { $countries } = useNuxtApp();
const { container, reports } = defineProps({
  container: { type: Object as PropType<MapContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
const goalName = computed(() => $countries.getName(container.goal, "en"))
const goal = computed(() => <HighlightItem[]>[{
  iso2: container.goal,
  color: "#2ED4BF",
}])
</script>

<template>
  <CountryMap v-model:highlighted="goal" :interact="false">
    <div class="absolute bottom-2 flex justify-center w-full z-500">
      <div class="badge md:badge-lg badge-success">Correct: {{ goalName }}</div>
    </div>
  </CountryMap>
</template>

<style scoped>

</style>