<script setup lang="ts">
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";
import type {AnyGameContainer} from "~/types/gameModels";
import {ref} from 'vue'
import {useIntersectionObserver} from "@vueuse/core";
import {MdPreview} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';

const isMobile = inject<boolean>('isMobile')
const { container } = defineProps({
  container: { type: Object as PropType<AnyGameContainer>, required: true }
})

const box = useTemplateRef('box')
const isVisible = ref(true)

const { stop } = useIntersectionObserver(box, ([entry], _) => {
  isVisible.value = entry?.isIntersecting || false
}, {
  threshold: 0.5
})

onUnmounted(() => stop())
</script>

<template>
  <div ref="box" class="bg-base-300 rounded-md p-5 border border-info mt-10 w-fit indicator" v-if="container.context">
    <span class="indicator-item indicator-start badge badge-info rounded-full px-0"><LightBulbIcon /></span>
    <MdPreview v-model="container.context" theme="dark" class="md-preview-custom" />
  </div>

  <div
      v-if="!isVisible"
      class="flex gap-1 fixed left-1/2 -translate-x-1/2 bg-info text-info-content px-3 py-1 rounded-full shadow-lg animate-bounce z-500"
      :class="{ 'bottom-5': !isMobile, 'bottom-22': isMobile }"
  >
    <LightBulbIcon />
    Context below ↓
  </div>
</template>

<style scoped>
@import "~/assets/md.css";
</style>