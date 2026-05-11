<script setup lang="ts">
import type {ZoomerContainer} from "~/types/gameModels";
import ZoomerTypeBadge from "~/components/games/zoomer/ZoomerTypeBadge.vue";
import CameraIcon from "~/components/icons/CameraIcon.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ZoomerDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<ZoomerContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <ZoomerTypeBadge :type="instance.goal" :style="'badge-info badge-outline'" />
    <div class="relative">
      <img :src="gameDef.getImgUrl(instance)" alt="game photo" loading="lazy" decoding="async" />

      <div class="absolute inset-x-0 bottom-0" v-if="instance && instance.data.author">
        <p class="text-left text-gray-300 bg-black/70 p-1">
          <CameraIcon class="inline-block" /> {{ instance.data.author }}
        </p>
      </div>
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>