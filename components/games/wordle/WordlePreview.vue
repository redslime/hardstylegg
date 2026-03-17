<script setup lang="ts">
import type {WordleContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.WordleDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<WordleContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
const letters = instance.artist.name.split("")
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <div class="flex gap-1">
      <div v-for="letter in letters" class="w-8 h-8 text-xl bg-[#6aaa64] rounded-sm text-center text-white uppercase font-bold">
        {{ letter }}
      </div>
    </div>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>