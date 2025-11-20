<script setup lang="ts" generic="T extends EditorContainer">

const { typeId, instance } = defineProps({
  typeId: { type: Number, required: true },
  instance: { type: Object as PropType<T>, required: true }
})

const { $gameRegistry } = useNuxtApp();
const comp = $gameRegistry.findGameById(typeId)!!.previewComponent
</script>

<template>
  <component :is="comp" :instance="instance" :pointer="false" />
</template>

<style scoped>

</style>