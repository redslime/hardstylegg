<script setup lang="ts" generic="T extends EditorContainer">
import type {ClientGameDef} from "~/utils/game/ClientGameDef";

const { gameDef, container } = defineProps({
  gameDef: { type: Object as PropType<ClientGameDef<T>>, required: true },
  container: { type: Object as PropType<T>, required: true }
})
const title = computed(() => gameDef.getIconPreviewTitle(container as T))
const details = inject<boolean>('details')
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center justify-center gap-2">
      <slot name="icon">
        <component :is="gameDef.icon" />
      </slot>
      <div class="text-xl font-bold text-base-content"
           :class="{
              'md:text-3xl': !details,
              'md:text-xl': details,
            }">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </div>
    <slot name="subtitle" />
  </div>
</template>

<style scoped>
</style>