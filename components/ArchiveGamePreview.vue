<script setup lang="ts">
import {type GameData, GameState} from "~/types/models";
import {getDayFriendlyName} from "~/utils/archive";

const { dayId, games } = defineProps({
  dayId: { type: Number, required: true },
  games: { type: Object as PropType<GameData[]>, required: true }
})
const emit = defineEmits(["click"])
const friendly = await getDayFriendlyName(dayId, "LLLL d")
</script>

<template>
  <div class="border-1 border-neutral rounded-md p-3 hover:border-primary transition-colors cursor-pointer bg-black/10 shadow-lg" @click="emit('click')">
    <h4 class="text-xl font-medium mb-2">{{ friendly }}</h4>

    <div class="flex gap-2 justify-center">
      <GameIconRow :games="games" :getState="_ => GameState.UPCOMING"/>
    </div>
  </div>
</template>

<style scoped>

</style>