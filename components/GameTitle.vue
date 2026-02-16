<script setup lang="ts" generic="T extends EditorContainer">
import type {ClientGameDef} from "~/utils/game/ClientGameDef";

const { gameDef, container, dashboard } = defineProps({
  gameDef: { type: Object as PropType<ClientGameDef<T>>, required: true },
  container: { type: Object as PropType<T>, required: true },
  dashboard: { type: Boolean, default: false }
})
const title = computed(() => dashboard ? gameDef.getDashboardHeaderTitle(container as T) : gameDef.getIconPreviewTitle(container as T))
const details = inject<boolean>('details')
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center justify-center gap-2">
      <div class="text-xl font-bold text-base-content text-balance text-center"
           :class="{ 'md:text-3xl': !details, 'md:text-xl': details }">
        <span class="mr-2 inline-block align-middle">
          <slot name="icon">
            <component
                :is="gameDef.icon"
                class="h-[1em] w-auto inline-block align-baseline text-primary"
            />
          </slot>
        </span>
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