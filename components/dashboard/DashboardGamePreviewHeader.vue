<script setup lang="ts">
import {getDashboardData, getScheduleForGame} from "~/utils/dashboard";
import type {ScheduleDay} from "~/types/models";

const emit = defineEmits(['clicked'])
const { typeId, container, title, pointer } = defineProps({
  typeId: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<{ id?: number, created_by?: number }>, required: true },
  title: { type: String as PropType<string>, required: true },
  pointer: { type: Boolean, default: true }
})

const { user } = useUserSession()
const dashboardData = await getDashboardData()
const scheduleData = computed<ScheduleDay | undefined>(() => getScheduleForGame(typeId, container.id))
const editable = user.admin || !scheduleData || !scheduleData.value
const editor = computed(() => dashboardData.editors.find(e => e.id === container.created_by))

function click() {
  if(pointer) {
    emit('clicked')
  }
}
</script>

<template>
  <div class="bg-base-200 p-3 max-w-[600px] rounded-lg" :class="{'cursor-pointer': pointer && editable}" @click="click()">
    <div class="text-2xl font-bold">{{ title }}</div>
    <div class="flex flex-wrap gap-1 mb-4">
      <div class="badge badge-success badge-soft badge-xs font-mono" v-if="scheduleData">Scheduled: {{ scheduleData.dayFriendly }}</div>
      <div class="badge badge-neutral badge-xs font-mono">ID: {{ container.id }}</div>
      <div class="badge badge-neutral badge-xs font-mono">
        Created by {{ editor?.name }}
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot>

      </slot>
    </div>
  </div>
</template>

<style scoped>

</style>