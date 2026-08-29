<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import PinIcon from "~/components/icons/PinIcon.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.MapDef
const { instance, pointer = true } = defineProps<{
  instance: MapContainer,
  pointer?: boolean
}>()

const countryName = computed(() => gameDef.getGoalName(instance))
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="badge badge-outline badge-info">
      <PinIcon class="-mx-2.5 h-5" v-if="instance.type === 'events'" />
      {{ countryName }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>