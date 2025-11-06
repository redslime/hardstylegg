<script setup lang="ts">
import FireIcon from "~/components/icons/FireIcon.vue";

const { streak } = defineProps<{ streak: number }>()
</script>

<template>
  <div role="alert" class="alert alert-warning alert-soft gap-2 px-1.5 py-1 mb-2" v-if="streak > 1">
    <FireIcon /><span class="font-semibold">You are on a {{ streak }} day streak!</span>
  </div>
</template>

<style scoped>

</style>