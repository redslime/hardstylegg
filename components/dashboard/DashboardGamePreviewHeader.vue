<script setup lang="ts">
import {getDashboardData, getScheduleForGame} from "~/utils/dashboard";
import type {ScheduleDay} from "~/types/models";
import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";

const emit = defineEmits(['clicked'])
const { gameDef, container, pointer } = defineProps({
  gameDef: { type: Object as PropType<ClientGameDef<any>>, required: true },
  container: { type: Object as PropType<{ id?: number, created_by?: number, context: string | null }>, required: true },
  pointer: { type: Boolean, default: true }
})

const dashboardData = await getDashboardData()
const scheduleData = computed<ScheduleDay | undefined>(() => getScheduleForGame(gameDef.id, container.id))
const title = gameDef.getDashboardHeaderTitle(container)
const todayId = computed(() => dashboardData.schedule.todayId)
const upcoming = computed(() => todayId.value && scheduleData.value && todayId.value <= scheduleData.value.day)
const past = computed(() => todayId.value && scheduleData.value && todayId.value > scheduleData.value.day)
const example = computed(() => container.id === 1)
const editor = computed(() => dashboardData.editors.find(e => e.id === container.created_by))
const hasContext = computed(() => {
  if(container.context !== null) {
    return true
  }

  // also check for context within items
  if('items' in container) {
    if(Array.isArray(container.items)) {
      const items = container.items as any[]
      return items.filter(i => typeof i === 'object' && 'context' in i && i.context !== null).length > 0
    }
  }

  return false
})

function click() {
  if(pointer) {
    emit('clicked')
  }
}
</script>

<template>
  <div class="border border-base-200 bg-base-200 p-3 max-w-[600px] rounded-lg" :class="{'cursor-pointer hover:border-primary transition-colors': pointer}" @click="click()">
    <div class="text-2xl font-bold">{{ title }}</div>
    <div class="flex flex-wrap gap-1 mb-4">
      <div class="badge badge-warning badge-soft badge-xs font-mono" v-if="past">Played on: {{ scheduleData!!.dayFriendly }}</div>
      <div class="badge badge-success badge-soft badge-xs font-mono" v-if="upcoming">Scheduled: {{ scheduleData!!.dayFriendly }}</div>
      <div class="badge badge-accent badge-soft badge-xs font-mono" v-if="example">Example</div>
      <div class="badge badge-neutral badge-xs font-mono">ID: {{ container.id }}</div>
      <div class="badge badge-neutral badge-xs font-mono">
        Created by {{ editor?.name }}
      </div>
      <div class="badge badge-info badge-soft badge-xs font-mono px-0 tooltip" data-tip="has context" v-if="hasContext"><LightBulbIcon :size="'size-4'" /></div>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot>

      </slot>
    </div>
  </div>
</template>

<style scoped>

</style>