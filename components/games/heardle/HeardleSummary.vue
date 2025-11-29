<script setup lang="ts">
import type {GameReportFlat} from "~/types/models";
import type {HeardleContainer} from "~/types/gameModels";
import WaveformEditor from "~/components/games/heardle/WaveformEditor.vue";

const { container, reports } = defineProps({
  container: { type: Object as PropType<HeardleContainer>, required: true },
  reports: { type: Array as PropType<GameReportFlat[]>, required: true }
})

const sourceUrl = computed(() => {
  return "/heardle/" + container.src + ".mp3"
})
</script>

<template>
  <div class="text-xl mb-3">Track segments:</div>
  <div class="flex flex-col gap-5">
    <template v-for="(dur, index) in container.durations" :key="dur">
      <div class="flex gap-2 items-center">
        <WaveformEditor v-model:duration="container.durations[index]!!" :previewUrl="sourceUrl" :disabled="true" />
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>