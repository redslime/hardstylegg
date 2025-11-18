<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import {NameXGame} from "~/utils/game/clientGameRegistry";

const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<NameXContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="NameXGame" :pointer="pointer" :container="instance">
    <div v-for="track in instance.items" :key="track.sid" class="badge badge-outline">
      {{ getName(track) }}
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>