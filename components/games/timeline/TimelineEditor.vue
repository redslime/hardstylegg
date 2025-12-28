<script lang="ts" setup>
import {type TimelineContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import TimelinePreview from "~/components/games/timeline/TimelinePreview.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.TimelineDef
const { data, pending, error } = await useAsyncData<TimelineContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<TimelineContainer[] | undefined>()
const editing = ref<TimelineContainer | undefined>()

watchOnce(data, () => instances.value = data.value)
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
    >
      <template #previewBody="{ instance, clicked }">
        <TimelinePreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle>
        <input type="text" placeholder="Title" required maxlength="128"
               class="input input-lg validator w-[80ch]"
               v-model="editing!!.title" />
      </template>

      <template #editBody>
        <input class="input validator" type="number" min="2000" max="2025" placeholder="Answer option"
               required v-model="editing!!.goal" />

        <ContextField v-model:input="editing!!.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>