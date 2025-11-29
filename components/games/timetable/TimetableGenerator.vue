<script setup lang="ts">
import type {TimetableContainer, TimetableItem} from "~/types/gameModels";
import {computed} from "vue";

const items = defineModel<TimetableItem[]>('items', { required: true })
const { container } = defineProps({
  container: { type: Object as PropType<TimetableContainer>, required: true }
})

const title = computed(() => container.title)
const colorBg = computed(() => container.color_bg)
const colorText = computed(() => container.color_text)

const hourHeight = 120
const blockGap = 8

const getMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h! * 60 + m!
}

const startTime = computed(() => items.value[0]?.begin ?? '00:00')
const endTime = computed(() => items.value.at(-1)?.end ?? '00:00')

const startMinutes = computed(() => getMinutes(startTime.value))
const endMinutes = computed(() => {
  const end = getMinutes(endTime.value)
  return end < startMinutes.value ? end + 24 * 60 : end
})

const hours = computed(() => {
  const arr: string[] = []
  for (let m = Math.floor(startMinutes.value / 60) * 60; m <= Math.ceil(endMinutes.value / 60) * 60; m += 60) {
    arr.push((Math.floor(m / 60) % 24).toString().padStart(2, '0'))
  }
  return arr
})

function getItemStyle(item: TimetableItem) {
  const b = getMinutes(item.begin)
  const e = getMinutes(item.end)
  const beginAbs = b < startMinutes.value ? b + 24 * 60 : b
  let endAbs = e < b ? e + 24 * 60 : e

  if (endAbs < beginAbs) endAbs += 24 * 60

  return {
    backgroundColor: colorBg.value,
    color: colorText.value,
    top: ((beginAbs - startMinutes.value) / 60) * hourHeight + "px",
    height: ((endAbs - beginAbs) / 60) * hourHeight - blockGap + "px",
    marginTop: blockGap / 2 + "px",
    marginBottom: blockGap / 2 + "px",
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center">
    <div class="text-xl text-base-content/80 mb-2">{{ title }}</div>

    <div class="flex items-center justify-center w-full sm:w-4/5 md:w-3/5">
      <div class="relative border-l border-base-300 w-full sm:w-4/5 md:w-3/5">
        <div
            v-for="hour in hours"
            :key="hour"
            class="relative flex -left-15"
            :style="{ height: hourHeight + 'px' }"
        >
        <span class="absolute -left-14 text-sm text-base-content/70">
          {{ hour }}:00
        </span>
          <div class="w-full border-t border-base-200"></div>
        </div>

        <div
            v-for="item in items"
            :key="item.name"
            class="absolute left-0 right-0 rounded-lg shadow-md px-3 py-1"
            :style="getItemStyle(item)"
        >
          <slot :item="item as TimetableItem" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>