<script setup lang="ts">
const details = inject<boolean>('details')
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center justify-center gap-2">
      <slot name="icon" />
      <div class="text-xl font-bold text-base-content"
           :class="{
              'md:text-3xl': !details,
              'md:text-xl': details,
            }">
        <slot name="title" />
      </div>
    </div>
    <slot name="subtitle" />
  </div>
</template>

<style scoped>
</style>