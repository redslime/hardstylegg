<script setup lang="ts">
import type {ZoomerContainer} from "~/types/gameModels";
import type {GameReportFlat} from "~/types/models";
import ZoomerTypeBadge from "~/components/games/zoomer/ZoomerTypeBadge.vue";
import CameraIcon from "~/components/icons/CameraIcon.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ZoomerDef
const { container, reports } = defineProps({
  container: { type: Object as PropType<ZoomerContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})
</script>

<template>
  <ZoomerTypeBadge :type="container.goal" :style="'badge-info badge-outline'" />
  <div class="relative">
    <img :src="gameDef.getImgUrl(container)" alt="game photo" />

    <div class="absolute inset-x-0 bottom-0" v-if="container && container.data.author">
      <p class="text-left text-gray-300 bg-black/70 p-1">
        <CameraIcon class="inline-block" /> {{ container.data.author }}
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>