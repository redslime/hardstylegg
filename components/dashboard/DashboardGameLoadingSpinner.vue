<script setup lang="ts">
import type {NuxtError} from "#app";

const { pending, error } = defineProps({
  pending: { type: Boolean, required: true },
  error: { type: Object as PropType<NuxtError>}
})
</script>

<template>
  <span class="loading loading-spinner loading-xl" v-if="pending"></span>

  <div role="alert" class="alert alert-error alert-soft" v-if="error">
    <span>Failed to load instances</span>
  </div>
</template>

<style scoped>

</style>