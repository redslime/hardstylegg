<script setup lang="ts">
import SearchIcon from "~/components/icons/SearchIcon.vue";

const query = defineModel<string>("query", {default: ""})

defineProps({
  placeholder: { type: String, default: "Search" },
  resultCount: { type: Number, default: 0 },
  minQueryLength: { type: Number, default: 5 },
  showHint: { type: Boolean, default: false }
})
</script>

<template>
  <div class="w-full">
    <label class="input my-3 w-full">
      <SearchIcon />
      <input
          v-model="query"
          type="text"
          class="grow"
          :placeholder="placeholder"
      />
      <span class="text-sm opacity-70">{{ resultCount }}</span>
    </label>

    <div
        v-if="showHint && (query?.trim().length ?? 0) < minQueryLength"
        class="text-sm opacity-70 mt-1"
    >
      Begin searching to see results...
    </div>
  </div>
</template>

<style scoped>
</style>