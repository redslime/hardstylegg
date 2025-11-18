<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import {MapGame} from "~/utils/game/clientGameRegistry";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<MapContainer>, required: true },
  pointer: { type: Boolean, default: true }
})

const { $countries } = useNuxtApp();
const countryName = computed(() => $countries.getName(instance.goal, "en"))
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="MapGame" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ countryName }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>