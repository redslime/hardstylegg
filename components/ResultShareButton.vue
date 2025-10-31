<script setup lang="ts">
import Checkmark from "~/components/icons/Checkmark.vue";
import CopyIcon from "~/components/icons/CopyIcon.vue";

const copied = ref<boolean>(false)

defineProps<{
  action: (() => void)
}>()
</script>

<template>
  <button class="btn btn-soft btn-primary" v-if="!copied" @click="action();copied=true;">
    <CopyIcon />
    Share result
  </button>
  <button class="btn btn-disabled border-success" v-else>
    <Checkmark class="text-success" />
    Copied result
  </button>
</template>

<style scoped>

</style>