<script setup lang="ts">
import type {NameXContainer} from "~/types/gameModels";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NameXDef
const { instance, pointer } = defineProps({
  instance: { type: Object as PropType<NameXContainer>, required: true },
  pointer: { type: Boolean, default: true }
})
</script>

<template>
  <DashboardGamePreviewHeader :gameDef="gameDef" :pointer="pointer" :container="instance">
    <template v-if="instance.items.type === 'text'">
      <div v-for="item in instance.items.items as string[]" :key="item" class="badge badge-outline">
        {{ item }}
      </div>
    </template>

    <template v-else-if="instance.items.type === 'album' || instance.items.type === 'track'">
      <div v-for="(content, index) in instance.items.items" :key="index" class="badge badge-outline">
        {{ content.getDisplayName() }}
      </div>
    </template>

    <template v-else-if="instance.items.type === 'artist'">
      <div v-for="(content, index) in instance.items.items" :key="index" class="badge badge-outline">
        {{ content.name }}
      </div>
    </template>
  </DashboardGamePreviewHeader>
</template>

<style scoped>

</style>