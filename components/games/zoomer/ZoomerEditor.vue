<script setup lang="ts">
import type {ZoomerContainer} from "~/types/gameModels";
import {watchOnce} from "@vueuse/shared";
import ZoomerPreview from "~/components/games/zoomer/ZoomerPreview.vue";
import {constructImageData} from "~/utils/zoomer";
import type {ZoomerImageData, ZoomerType} from "~/types/zoomerModels";
import ZoomerCropper from "~/components/games/zoomer/ZoomerCropper.vue";
import ZoomerGoalSelector from "~/components/games/zoomer/ZoomerGoalSelector.vue";
import ZoomerTypeBadge from "~/components/games/zoomer/ZoomerTypeBadge.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.ZoomerDef
const { data, pending, error } = await useAsyncData<ZoomerContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<ZoomerContainer[] | undefined>()
const editing = ref<ZoomerContainer | undefined>()

const cropResult = ref<ZoomerImageData>(constructImageData("", "", 0, 0) as ZoomerImageData)
const ready = computed(() => cropResult.value?.stepHeights.length === 5)

function reset() {
  cropResult.value = constructImageData("", "", 0, 0) as ZoomerImageData
}

function select(type: ZoomerType) {
  editing.value!!.goal = type

  if(type.id === "artist") {
    editing.value!!.title = "Which artist is pictured here?"
  } else if(type.id === "festival") {
    editing.value!!.title = "Which festival is pictured here?"
  }
}

watchOnce(data, () => instances.value = data.value)
watch(ready, () => {
  if(ready.value) {
    editing.value!!.data = cropResult.value
  }
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @cancelled="reset()"
        @saved="reset()"
      >
      <template #previewBody="{ instance, clicked }">
        <ZoomerPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing!!?.goal">
        <input type="text" :value="gameDef.getTitle(editing!!)" class="input input-lg w-[80ch]" />
      </template>

      <template #editBody>
        <template v-if="!editing!!.id">
          <ZoomerGoalSelector v-if="!editing!!.goal" @select="g => select(g)" />
          <ZoomerTypeBadge v-if="editing!!.goal" :type="editing!!.goal" />
          <div class="mt-5"></div>
          <ZoomerCropper v-if="editing!!.goal" v-model="cropResult" />
        </template>
        <template v-else>
          <div role="alert" class="alert alert-warning">
            <span>Zoomer editing is not supported, please delete and re-create if needed.</span>
          </div>
        </template>
      </template>
    </DashboardGameEditor>
  </div>
</template>