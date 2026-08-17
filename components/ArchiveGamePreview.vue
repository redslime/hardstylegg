<script setup lang="ts">
import {type GameContainer} from "~/types/models";
import {getDayFriendlyName} from "~/utils/archive";
import {useArchiveStore} from "~/stores/archive.ts";

const { container } = defineProps({
  container: { type: Object as PropType<GameContainer>, required: true }
})
const emit = defineEmits<{ click: [] }>()
const friendly = await getDayFriendlyName(container.dayId, "LLLL d")
const { lastDayId, hasPlayed: _hasPlayed, getGameScore } = useArchiveStore()
const hasPlayed = computed<boolean>(() => _hasPlayed(container.dayId))
const isLast = computed<boolean>(() => lastDayId === container.dayId)
</script>

<template>
  <div class="relative border rounded-md p-3 hover:border-primary transition-colors cursor-pointer bg-black/10 shadow-lg"
       :class="{'border-neutral': !hasPlayed, 'border-white/30': hasPlayed}"
       @click="emit('click')">
    <div class="absolute top-0 right-1" v-if="hasPlayed">
      <div class="badge badge-neutral badge-xs" v-if="isLast">last played</div>
      <div class="badge badge-neutral badge-xs" v-else>played</div>
    </div>
    <h4 class="text-xl font-medium">{{ friendly }}</h4>
    <h4 class="text-xl text-secondary font-medium" v-if="container.theme">{{ container.theme }}</h4>

    <div class="flex gap-2 justify-center mt-2">
      <GameIconRow :games="container.data" :getState="i => getGameScore(container.dayId, i)" />
    </div>
  </div>
</template>

<style scoped>

</style>