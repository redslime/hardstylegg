<script setup lang="ts">

import {type TimelineContainer, validateTimeline} from "~/types/gameModels";
import {getTimelineData} from "~/utils/dashboard";
import {deepCopy} from "~/utils/utils";
import Calendar from "~/components/icons/game/Calendar.vue";
import DashboardTimelinePreview from "~/components/dashboard/DashboardTimelinePreview.vue";
import DashboardGameDeleteButton from "~/components/dashboard/DashboardGameDeleteButton.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const { data, pending, error } = await useAsyncData<TimelineContainer[]>(() => getTimelineData(), { lazy: true })
const instances = computed<TimelineContainer[] | undefined>(() => data.value)
const savingModal = ref<HTMLDialogElement | undefined>()
const savingResponse = ref<boolean | String[] | undefined>()
const editing = ref<TimelineContainer | undefined>()
const editingErrors = computed<string[]>(() => {
  if(editing.value !== undefined) {
    return validateTimeline(editing.value!!)
  } else {
    return ["invalid editing state"]
  }
})

function cancel() {
  editing.value = undefined
}

async function save() {
  savingResponse.value = undefined
  savingModal.value?.showModal()

  if(editing.value !== undefined) {
    const timeline = editing.value!!
    timeline.created_by = user.value.id

    const { data, error } = await useFetch<String[] | TimelineContainer>('/api/dashboard/edit/timeline', {
      method: 'POST',
      body: timeline
    })

    if(error.value) {
      savingResponse.value = [error.value.message]
      return
    } else if (data.value) {
      if(!Array.isArray(data.value)) {
        const fetchedTimeline = data.value
        instances.value?.splice(0, instances.value.length, ...instances.value?.filter(i => i.id !== fetchedTimeline.id))
        instances.value?.push(fetchedTimeline)
        instances.value?.sort((a, b) => (a.id ?? 100) - (b.id ?? 100))
        savingResponse.value = true
        editing.value = undefined
        savingModal.value?.close()
      } else {
        savingResponse.value = data.value
      }
    }
  } else {
    savingResponse.value = ["Invalid editing state"]
  }
}

function onDelete(timline: TimelineContainer) {
  instances.value?.splice(0, instances.value.length, ...instances.value?.filter(i => i.id !== fetchedTimeline.id))
  editing.value = undefined
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><Calendar class="size-8" /></span>
    <div v-if="!editing">
      Timeline instances
      <div v-if="instances" class="badge badge-soft badge-primary badge-xl">{{ instances.length }}</div>
      <button class="btn btn-success btn-soft btn-sm ml-2" @click="editing=deepCopy({title: '', items: []})">
        Create new
      </button>
    </div>
    <div v-else-if="editing.id !== undefined">
      Editing timeline instance with <span class="font-mono">id={{ editing.id }}</span>
    </div>
    <div v-else>
      Creating new timeline instance
    </div>
  </div>

  <span class="loading loading-spinner loading-xl" v-if="pending"></span>

  <div role="alert" class="alert alert-error alert-soft" v-if="error">
    <span>Failed to load timeline instances</span>
  </div>

  <div class="flex flex-wrap gap-3" v-if="editing === undefined && instances">
    <template v-for="timeline in instances" :key="timeline.id">
      <DashboardTimelinePreview :timeline="timeline" @clicked="editing = deepCopy(timeline)" />
    </template>
  </div>

  <div class="flex flex-col gap-3" v-if="editing != null">
    <div class="bg-base-200 w-fit p-3 rounded-lg">
      <div class="font-bold mb-4">
        <input type="text" placeholder="Timeline title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
               v-model="editing.title" />
      </div>

      <input class="input validator focus:outline-none focus:ring-0" type="number" min="2000" max="2025" placeholder="Answer option"
             required v-model="editing.goal" />

      <div class="mt-4" v-if="editingErrors.length > 0">
        <div class="text-error" v-for="error in editingErrors" :key="error">
          {{ error }}.
        </div>
      </div>
    </div>

    <div class="flex gap-5">
      <div class="join">
        <button class="btn btn-neutral join-item" @click="cancel">Cancel</button>
        <button class="btn btn-success join-item" @click="save" :disabled="editingErrors.length > 0">Save</button>
      </div>
      <DashboardGameDeleteButton :editing="editing" :typeId="8" @deleted="onDelete" />
    </div>
  </div>

  <dialog ref="savingModal" id="savingModal" class="modal">
    <div class="modal-box" v-if="savingResponse === undefined">
      <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Saving...</h3>
    </div>
    <div class="modal-box" v-else-if="savingResponse === true">
      <h3 class="text-xl font-bold text-center">Saved successfully</h3>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
    <div class="modal-box" v-else>
      <h3 class="text-xl font-bold text-center">Error</h3>
      <p v-for="error in savingResponse" class="text-error">{{ error }}</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.validator {
  &:user-valid, &:has(:user-valid) {
    &, &:focus, &:checked, &[aria-checked="true"], &:focus-within {
      --input-color: inherit;
    }
  }
}
</style>