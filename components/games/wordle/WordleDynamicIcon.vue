<script setup lang="ts">

const { board } = defineProps({
  board: { type: String, required: true }
})

const rows = computed<string[]>(() => board?.split(","))
const lastRow = computed(() => rows.value.length-1)
const lastCol = computed(() => [...rows.value[0]!!].length-1)
</script>

<template>
  <div class="w-12 h-12">
    <div class="grid grid-flow-row h-full">
      <div v-for="(row, rowIndex) in rows" class="grid grid-flow-col">
        <div v-for="(col, colIndex) in [...row]"
          :class="{
            'bg-neutral': col === '-',
            'bg-warning': col === 'o',
            'bg-success': col === 'x',
            'rounded-tl-md': rowIndex === 0 && colIndex === 0,
            'rounded-tr-md': rowIndex === 0 && colIndex === lastCol,
            'rounded-bl-md': rowIndex === lastRow && colIndex === 0,
            'rounded-br-md': rowIndex === lastRow && colIndex === lastCol,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>