<script setup lang="ts">
import type {OrderContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.OrderDef
const { instance, pointer = true } = defineProps<{
  instance: OrderContainer,
  pointer?: boolean
}>()
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="w-full flex gap-2">
      <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2" v-for="item in instance.items" :key="item.track.sid">
        <img
            :src="item.track.getImageUrl()"
            :alt="item.track.title"
            class="w-full h-auto rounded-xl shrink shadow-md"
        />
      </div>
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>