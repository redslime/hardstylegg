<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
import ChartBarIcon from "~/components/icons/ChartBarIcon.vue";

const { gameReports } = defineProps({
  gameReports: { type: Object as PropType<GameReportFlat[]>, required: true }
})
const valid = computed(() => gameReports.length > 0)
const successRate = computed(() => Math.round(gameReports.filter(r => r.success).length / gameReports.length * 100))
const hasAttempts = computed(() => gameReports.some(r => r.attempts !== null))
const avgAttempts = computed(() => Math.round(gameReports.reduce((acc, r) => acc + (r.attempts ?? 1), 0) / gameReports.length * 100) / 100)
</script>

<template>
  <div class="w-fit border-1 border-white/50 rounded-md p-3">
    <div class="flex justify-center gap-1">
      <ChartBarIcon class="text-primary" />
      <h2 class="font-bold text-center text-xl mb-1">Game performance</h2>
    </div>
    <div class="text-center" v-if="valid">
      <p><span class="font-medium">Success rate:</span> {{ successRate }}%</p>
      <p v-if="hasAttempts"><span class="font-medium">Average attempts:</span> {{ avgAttempts }}</p>
    </div>
    <div class="text-center" v-else>
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </div>
</template>

<style scoped>

</style>