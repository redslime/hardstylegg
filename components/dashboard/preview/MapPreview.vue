<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import {getName} from "i18n-iso-countries"
import {MapGame} from "~/utils/game/clientGameRegistry";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<MapContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="MapGame" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">{{ getName(instance.goal, "en") }}</div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>