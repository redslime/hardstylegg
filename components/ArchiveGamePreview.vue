<script setup lang="ts">
import {type GameContainer, GameState} from "~/types/models";
import {getDayFriendlyName} from "~/utils/archive";

const { container } = defineProps({
  container: { type: Object as PropType<GameContainer>, required: true }
})
const emit = defineEmits<{ click: [] }>()
const friendly = await getDayFriendlyName(container.dayId, "LLLL d")
</script>

<template>
  <div class="border-1 border-neutral rounded-md p-3 hover:border-primary transition-colors cursor-pointer bg-black/10 shadow-lg" @click="emit('click')">
    <h4 class="text-xl font-medium">{{ friendly }}</h4>
    <h4 class="text-xl text-secondary font-medium" v-if="container.theme">{{ container.theme }}</h4>

    <div class="flex gap-2 justify-center mt-2">
      <GameIconRow :games="container.data" :getState="_ => GameState.UPCOMING"/>
    </div>
  </div>
</template>

<style scoped>

</style>