<script setup lang="ts" generic="T extends EditorContainer">

import {deepCopy, deepCopyReactive} from "~/utils/utils";
import DashboardGameDeleteButton from "~/components/dashboard/DashboardGameDeleteButton.vue";
import {GameState, type ScheduleDay} from "~/types/models";
import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import {getScheduleForGame} from "~/utils/dashboard";
import PlayIcon from "~/components/icons/PlayIcon.vue";

const instances = defineModel<T[] | undefined>('instances', {
  required: true,
})
const editing = defineModel<T | undefined>('editing', {
  required: true,
  default: undefined,
})

const { gameDef } = defineProps({
  gameDef: { type: Object as PropType<ClientGameDef<T>>, required: true },
})

const emit = defineEmits(['saved', 'cancelled'])

const { user } = useUserSession()
const typeName = computed(() => gameDef.getSpacedName())
const savingModal = ref<HTMLDialogElement | undefined>()
const savingResponse = ref<boolean | String[] | undefined>()
const editingErrors = computed<string[]>(() => gameDef.validate(editing.value!!))
const editingExample = computed<boolean>(() => editing.value?.id === 1)
const previewModal = ref<HTMLDialogElement | undefined>()
const previewState = ref<GameState>(GameState.PLAYING)
const previewCounter = ref<number>(0)

// preview injections
provide("details", false)
provide("summary", false)
provide("currentIndex", 1)

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
      const data = await $fetch<string[] | T>(gameDef.getEditUrl(), {
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
  const scheduleData = computed<ScheduleDay | undefined>(() => getScheduleForGame(gameDef.id, instance.id))
  const editable = user.value.admin || !scheduleData || !scheduleData.value || instance.id === 1

  if(editable) {
    editing.value = deepCopy(instance)
  }
}

async function startPreview() {
  // silly workaround to get the component to fully reset and clear any local consts
  previewCounter.value++
  await nextTick()
  previewState.value = GameState.PLAYING
  previewModal?.value?.showModal()
}

const previewListener = (state: GameState) => {
  previewState.value = state
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><component :is="gameDef.icon" class="size-8" /></span>
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
        <button class="btn btn-success join-item" @click="save" :disabled="editingErrors.length > 0 || editingExample">Save</button>
      </div>
      <button class="btn btn-soft btn-info" :disabled="editingErrors.length > 0" @click="startPreview()"><PlayIcon /> Live preview</button>
      <DashboardGameDeleteButton :editing="editing" :typeId="gameDef.id" @deleted="onDelete" />
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

  <dialog ref="previewModal" id="previewModal" class="modal" v-if="editing">
    <div class="modal-box max-w-4xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <div class="badge badge-primary badge-xs" v-if="previewState === GameState.PLAYING">State: Playing</div>
      <div class="badge badge-success badge-xs" v-else-if="previewState === GameState.SUCCEEDED">State: Succeeded</div>
      <div class="badge badge-error badge-xs" v-if="previewState === GameState.FAILED">State: Failed</div>
      <div class="flex flex-col items-center">
        <component :is="gameDef.gameComponent" :key="previewCounter" :state="previewState" :position="1" :container="deepCopyReactive(editing)" @onFinish="previewListener" />
      </div>
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