<script setup lang="ts" generic="T extends EditorContainer">

import {deepCopy} from "~/utils/utils";
import DashboardGameDeleteButton from "~/components/dashboard/DashboardGameDeleteButton.vue";
import type {ScheduleDay} from "~/types/models";

const instances = defineModel<T[] | undefined>('instances', {
  required: true,
})
const editing = defineModel<T | undefined>('editing', {
  required: true,
  default: undefined,
})

const { validator, editUrl, typeId, typeName, icon } = defineProps({
  validator: { type: Function as PropType<() => string[]>, required: true },
  editUrl: { type: String, required: true },
  typeId: { type: Number, required: true },
  typeName: { type: String, required: true },
  icon: { type: Object as PropType<Component>, required: true },
  title: { type: Function as PropType<(game: T) => string>, required: true }
})

const emit = defineEmits(['saved', 'cancelled'])

const { user } = useUserSession()
const savingModal = ref<HTMLDialogElement | undefined>()
const savingResponse = ref<boolean | String[] | undefined>()
const editingErrors = computed<string[]>(() => validator())

function cancel() {
  editing.value = undefined
  emit('cancelled')
}

async function save() {
  savingResponse.value = undefined
  savingModal.value?.showModal()

  if (editing.value !== undefined) {
    const gameInstance = editing.value!
    gameInstance.created_by = user.value.id

    try {
      const data = await $fetch<string[] | T>(editUrl, {
        method: 'POST',
        body: gameInstance,
      })

      if (data) {
        if (!Array.isArray(data)) {
          const fetchedGameInstance = data as T
          instances.value?.splice(0, instances.value.length, ...instances.value.filter((i) => i.id !== fetchedGameInstance.id))
          instances.value?.push(fetchedGameInstance)
          instances.value?.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))

          savingResponse.value = true
          editing.value = undefined
          savingModal.value?.close()
          emit('saved')
        } else {
          savingResponse.value = data
        }
      }
    } catch (e: any) {
      savingResponse.value = [e.message]
    }
  } else {
    savingResponse.value = ["Invalid editing state"]
  }
}

function onDelete(container: T) {
  instances.value?.splice(0, instances.value.length, ...instances.value?.filter(i => i.id !== container.id))
  editing.value = undefined
}

function tryEdit(instance: T) {
  const scheduleData = computed<ScheduleDay | undefined>(() => getScheduleForGame(typeId, instance.id))
  const editable = user.value.admin || !scheduleData || !scheduleData.value

  if(editable) {
    editing.value = deepCopy(instance)
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><component :is="icon" class="size-8" /></span>
    <div v-if="!editing">
      {{ typeName }} instances
      <div v-if="instances" class="badge badge-soft badge-primary badge-xl">{{ instances.length }}</div>
      <button class="btn btn-success btn-soft btn-sm ml-2" @click="editing=deepCopy({title: '', items: []})">
        Create new
      </button>
    </div>
    <div v-else-if="editing.id !== undefined">
      Editing {{ typeName }} instance with <span class="font-mono">id={{ editing.id }}</span>
    </div>
    <div v-else>
      Creating new {{ typeName }} instance
    </div>
  </div>

  <div class="flex flex-wrap gap-3" v-if="editing === undefined && instances">
    <template v-for="instance in instances" :key="instance.id">
      <slot name="previewBody" :instance="instance" :clicked="() => tryEdit(instance)">

      </slot>
    </template>
  </div>

  <div class="flex flex-col gap-3" v-if="editing != null">
    <div class="bg-base-200 w-fit p-3 rounded-lg">
      <div class="font-bold mb-4">
        <slot name="editTitle">

        </slot>
      </div>

      <slot name="editBody">

      </slot>

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
      <DashboardGameDeleteButton :editing="editing" :typeId="typeId" @deleted="onDelete" />
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