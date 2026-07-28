<script setup lang="ts">
import {ref} from 'vue'
import ArrowUpTrayIcon from "~/components/icons/ArrowUpTrayIcon.vue";
import {processImageToWebP} from "~/utils/image";

const img64 = defineModel<string | undefined>('img64', { required: true })
const isDragging = ref(false)

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    img64.value = await processImageToWebP(file)
  } catch (err: any) {
    alert(err.message)
  }
}

async function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  try {
    img64.value = await processImageToWebP(file)
  } catch (err: any) {
    alert(err.message)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}
</script>

<template>
  <div class="w-full h-full">
    <label
        for="file-input"
        class="flex flex-col items-center justify-center h-full rounded-lg cursor-pointer transition"
        :class="{
        'border-base-content/20': !isDragging,
        'border-primary bg-primary/10': isDragging
      }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop="handleDrop"
    >
      <template v-if="!img64">
        <ArrowUpTrayIcon class="size-8" />
        <div class="text-base-content/80 text-center">
          <p class="font-medium">Blank artwork</p>
          <p class="text-sm text-base-content/50">Click or drop image</p>
        </div>
      </template>
      <img
          v-else
          :src="img64"
          alt="Preview"
          class="h-full object-contain rounded-lg"
      />
    </label>
    <input
        id="file-input"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
    />
  </div>
</template>
