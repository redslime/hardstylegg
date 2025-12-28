<script setup lang="ts">
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";
import type {AnyGameContainer} from "~/types/gameModels";

const { container } = defineProps({
  container: { type: Object as PropType<AnyGameContainer>, required: true }
})
</script>

<template>
  <div class="bg-base-300 rounded-md p-5 border border-info mt-10 w-fit indicator whitespace-pre-line" v-if="container.context">
    <span class="indicator-item indicator-start badge badge-info rounded-full px-0"><LightBulbIcon /></span>
    {{ container.context }}
  </div>
</template>

<style scoped>

</style>