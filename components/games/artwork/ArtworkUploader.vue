<script setup lang="ts">
import { ref } from 'vue'
import ArrowUpTrayIcon from "~/components/icons/ArrowUpTrayIcon.vue";

const selectedFile = defineModel<File | null>('selectedFile', { required: true })
const previewUrl = defineModel<string | null>('previewUrl', { required: true })
const emit = defineEmits(['selected'])
const isDragging = ref(false)

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  emit('selected')
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  setPreview(file)
}

function setPreview(file: File) {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
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
  <div class="w-full">
    <div>
      <label
          for="file-input"
          class="flex flex-col items-center justify-center h-40 rounded-lg cursor-pointer transition"
          :class="{
          'border-base-content/20': !isDragging,
          'border-primary bg-primary/10': isDragging
        }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop="handleDrop"
      >
        <ArrowUpTrayIcon v-if="!previewUrl" class="size-8" />
        <div v-if="!previewUrl" class="text-base-content/80 text-center">
          <p class="font-medium">Blank artwork</p>
          <p class="text-sm text-base-content/50">Click or drop .png file</p>
        </div>
        <img
            v-else
            :src="previewUrl"
            alt="Preview"
            class="h-full object-contain rounded-lg"
        />
      </label>
      <input
          id="file-input"
          type="file"
          accept="image/png"
          class="hidden"
          @change="handleFileChange"
      />
    </div>
  </div>
</template>
