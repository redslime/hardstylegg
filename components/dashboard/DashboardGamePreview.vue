<script setup lang="ts" generic="T extends EditorContainer">
import {findGameById} from "~/utils/game/clientGameRegistry";

const { typeId, instance } = defineProps({
  typeId: { type: Number, required: true },
  instance: { type: Object as PropType<T>, required: true }
})

const comp = findGameById(typeId)!!.previewComponent
</script>

<template>
  <component :is="comp" :instance="instance" :pointer="false" />
</template>

<style scoped>

</style>