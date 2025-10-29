<script setup lang="ts">
import type {TimelineContainer} from "~/types/gameModels";

const { timeline } = defineProps({
  timeline: { type: Object as PropType<TimelineContainer>, required: true }
})
const goal = timeline.goal
</script>

<template>
  <DashboardGamePreview :type-id="8" :container="timeline" :title="timeline.title">
    <div class="badge badge-outline badge-success">{{ goal }}</div>
  </DashboardGamePreview>
</template>

<style scoped>

</style>