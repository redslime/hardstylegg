<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";
import type {Track} from "~/types/models";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NameXDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<NameXContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <template v-if="instance.tracks">
      <div v-for="track in instance.items as Track[]" :key="track.sid" class="badge badge-outline">
        {{ getName(track) }}
      </div>
    </template>
    <template v-else>
      <div v-for="item in instance.items as string[]" :key="item" class="badge badge-outline">
        {{ item }}
      </div>
    </template>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>