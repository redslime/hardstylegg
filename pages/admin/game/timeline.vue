<script lang="ts" setup>
import {type TimelineContainer} from "~/types/gameModels";
import {getTimelineData} from "~/utils/dashboard";
import {validateTimeline} from "~/utils/gameValidators"
import Calendar from "~/components/icons/game/Calendar.vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<TimelineContainer[]>(() => getTimelineData(), { lazy: true })
const instances = computed<TimelineContainer[] | undefined>(() => data.value)
const editing = ref<TimelineContainer | undefined>()
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :validator="() => validateTimeline(editing!!)"
        :editUrl="'/api/dashboard/edit/timeline'"
        :typeId="8"
        :typeName="'Timeline'"
        :icon="Calendar"
        :title="t => t.title"
    >
      <template #previewBody="{ instance }">
        <div class="badge badge-outline badge-info">{{ instance.goal }}</div>
      </template>

      <template #editTitle>
        <input type="text" placeholder="Title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
               v-model="editing!!.title" />
      </template>

      <template #editBody>
        <input class="input validator focus:outline-none focus:ring-0" type="number" min="2000" max="2025" placeholder="Answer option"
               required v-model="editing!!.goal" />
      </template>
    </DashboardGameEditor>
  </div>
</template>