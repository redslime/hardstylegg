<script setup lang="ts">
import type {AnyGameContainers} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const emit = defineEmits(['select'])
const { typeId } = defineProps({
  typeId: { type: Number, required: true }
})
const { data, pending, error, clear } = await useAsyncData<AnyGameContainers>(() => {
  return $gameRegistry.findGameById(typeId)!!.getAllInstances()
}, { lazy: true })

function select(instance: any) {
  emit('select', { data: instance, typeId: typeId})
}

onUnmounted(() => {
  clear()
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div class="flex flex-wrap gap-4 justify-center" v-if="data">
    <div class="relative group w-fit" v-for="instance in data" :key="instance.id">
      <DashboardGamePreview :typeId="typeId!!" :instance="instance" />

      <div class="absolute z-10 inset-0 rounded-lg border-1 border-primary flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" @click="select(instance)">

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>