<script setup lang="ts">
import type {AnyGameContainer, AnyGameContainers} from "~/types/gameModels";
import {type Editor, StateFilter} from "~/types/models";
import {getScheduleForGame} from "~/utils/dashboard";
import DashboardStateFilterSelector from "~/components/dashboard/DashboardStateFilterSelector.vue";

const { user } = useUserSession()
const { $gameRegistry } = useNuxtApp();
const emit = defineEmits<{
  select: [obj: { data: AnyGameContainer, typeId: number }]
}>()
const { typeId } = defineProps({
  typeId: { type: Number, required: true }
})
const { data, pending, error, clear } = await useAsyncData<AnyGameContainers>(() => {
  return $gameRegistry.findGameById(typeId)!!.getAllInstances()
}, { lazy: true })

const editorFilter = ref<Editor | undefined>(undefined)
const filteredData = computed<AnyGameContainer[]>(() => {
  const f1: (instance: AnyGameContainer) => boolean = i => {
    const schedule = getScheduleForGame(typeId, i.id)
    return schedule === undefined // = unused state
  }
  const f2: (instance: AnyGameContainer) => boolean = i => {
    if(editorFilter.value) {
      return editorFilter.value?.id === i.created_by
    }

    return true
  }
  const f3: (instance: AnyGameContainer) => boolean = i => i.id !== 1 // exclude example

  return data.value?.filter(f1).filter(f2).filter(f3) ?? []
})

function select(instance: AnyGameContainer) {
  emit('select', { data: instance, typeId: typeId})
}

onUnmounted(() => {
  clear()
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <template v-if="data">
    <div class="flex gap-3 mb-5">
      <DashboardStateFilterSelector v-model:state="StateFilter.UNUSED" :disabled="true" />
      <DashboardEditorFilterSelector v-model:editor="editorFilter" v-if="user.admin" />
    </div>

    <div class="flex flex-wrap gap-4 justify-center">
      <div class="relative group w-fit" v-for="instance in filteredData" :key="instance.id">
        <DashboardGamePreview :typeId="typeId!!" :instance="instance" />

        <div class="absolute z-5 inset-0 rounded-lg border-1 border-primary flex items-center justify-center gap-3
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            @click="select(instance)">
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>

</style>