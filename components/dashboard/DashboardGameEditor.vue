<script setup lang="ts" generic="T extends EditorContainer">

import {deepCopy, deepCopyReactive} from "~/utils/utils";
import DashboardGameDeleteButton from "~/components/dashboard/DashboardGameDeleteButton.vue";
import {type Editor, type GameReportFlat, GameState, type ScheduleDay, SortMode, StateFilter} from "~/types/models";
import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import {getDashboardData, getScheduleForGame} from "~/utils/dashboard";
import PlayIcon from "~/components/icons/PlayIcon.vue";
import DashboardStateFilterSelector from "~/components/dashboard/DashboardStateFilterSelector.vue";
import DashboardGameBasicStats from "~/components/dashboard/DashboardGameBasicStats.vue";
import ContextBox from "~/components/ContextBox.vue";
import type {AnyGameContainer} from "~/types/gameModels";

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

const emit = defineEmits<{
  saved: [],
  cancelled: []
}>()

const router = useRouter()
const idParam = computed<string | undefined>(() => useRoute().query.id as string | undefined)
const newParam = computed<string | undefined>(() => useRoute().query.new as string | undefined)
const { user } = useUserSession()
const dashboardData = await getDashboardData()
const todayId = computed(() => dashboardData.schedule.todayId)
const typeName = computed(() => gameDef.getSpacedName())
const savingModal = ref<HTMLDialogElement | undefined>()
const savingResponse = ref<boolean | String[] | undefined>()
const creating = ref<boolean>(false)
const editingErrors = computed<string[]>(() => gameDef.validate(editing.value!!))
const editingExample = computed<boolean>(() => editing.value?.id === 1)
const editingSchedule = computed<ScheduleDay | undefined>(() => getScheduleForGame(gameDef.id, editing.value?.id))
const editingIsPast = computed<boolean>(() => editingSchedule.value?.day !== undefined && editingSchedule.value.day < todayId.value)
const editingGameReports = ref<GameReportFlat[]>([])
const editingForced = ref<boolean>(false)
const previewModal = ref<HTMLDialogElement | undefined>()
const previewState = ref<GameState>(GameState.PLAYING)
const previewCounter = ref<number>(0)
const previewOpen = ref<boolean>(false)
const stateFilter = ref<StateFilter>(StateFilter.ALL)
const editorFilter = ref<Editor | undefined>(undefined)
const sortMode = ref<SortMode>(SortMode.ID)

const filteredInstances = computed(() => {
  const f1: (instance: T) => boolean = i => {
    if(stateFilter.value === StateFilter.ALL) return true

    const schedule = getScheduleForGame(gameDef.id, i.id)

    if(stateFilter.value === StateFilter.UNUSED && schedule === undefined) return true
    if(stateFilter.value === StateFilter.PAST && schedule !== undefined && schedule.day !== undefined && schedule.day < todayId.value) return true
    if(stateFilter.value === StateFilter.UPCOMING && schedule !== undefined && schedule.day !== undefined && schedule.day >= todayId.value) return true

    return false
  }
  const f2: (instance: T) => boolean = i => {
    if(editorFilter.value) {
      return editorFilter.value?.id === i.created_by
    }

    return true
  }

  return instances.value?.filter(f1).filter(f2) ?? []
})
const hiddenCount = computed(() => (instances.value?.length ?? 0) - filteredInstances.value.length)
const instanceSorter = computed<(a: T, b: T) => number>(() => {
  if(sortMode.value === SortMode.SCHEDULE) {
    return (a: T, b: T) => {
      const aa = getScheduleForGame(gameDef.id, a.id)?.day ?? 9999
      const bb = getScheduleForGame(gameDef.id, b.id)?.day ?? 9999
      return aa - bb
    }
  } else {
    // ID mode (creation date)
    return (a: T, b: T) => (a.id ?? 0) - (b.id ?? 0)
  }
})

// preview injections
provide("details", false)
provide("summary", false)
provide("currentIndex", 1)

function createNew() {
  router.push({ query: { new: "1" }})
  editing.value = gameDef.remap(deepCopy({title: '', items: []}))
  creating.value = true
}

function cancel() {
  editing.value = undefined
  editingForced.value = false
  creating.value = false
  router.back()
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
          const fetchedGameInstance = gameDef.remap(data as T)
          instances.value?.splice(0, instances.value.length, ...instances.value.filter((i) => i.id !== fetchedGameInstance.id))
          instances.value?.push(fetchedGameInstance)
          instances.value = instances.value?.sort(instanceSorter.value)

          savingResponse.value = true
          creating.value = false
          editing.value = undefined
          editingForced.value = false
          savingModal.value?.close()
          router.back()
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

function onDelete(gameId: number) {
  instances.value = instances.value?.filter(i => i.id !== gameId).sort(instanceSorter.value)
  editing.value = undefined
  creating.value = false
  router.back()
}

function tryEdit(instance: T) {
  editing.value = gameDef.remap(deepCopy(instance))
  navigateTo({ query: { id: instance.id } })
  window.scrollTo({ top: 0 })
}

async function startPreview() {
  // silly workaround to get the component to fully reset and clear any local consts
  editing.value = gameDef.remap(editing.value)
  previewCounter.value++
  previewOpen.value = true
  await nextTick()
  previewState.value = GameState.PLAYING
  previewModal?.value?.showModal()
}

const previewListener = (state: GameState) => {
  previewState.value = state
}

watch(editing, async () => {
  if(editing.value && editingIsPast.value && editing.value.id) {
    editingGameReports.value = await gameDef.getGameReports(editing.value.id)
  } else {
    editingGameReports.value = []
  }
})

watch(sortMode, () => {
  instances.value = instances.value?.sort(instanceSorter.value)
})

watch(idParam, newId => {
  if(!newId) {
    editing.value = undefined
    editingForced.value = false
    emit('cancelled')
  } else {
    const intId = parseInt(newId)
    editing.value = filteredInstances.value?.find(i => i.id === intId)
  }
})

watch(newParam, newId => {
  if(!newId && creating.value) {
    editing.value = undefined
    editingForced.value = false
    emit('cancelled')
  }
})

onMounted(() => {
  const route = useRoute()
  const focusId: string | undefined = route.query.id as string

  if(focusId) {
    const intId = parseInt(focusId)
    editing.value = instances.value?.find(i => i.id === intId)
    window.scrollTo({ top: 0 })
  }
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><component :is="gameDef.icon" class="size-8" /></span>
    <div v-if="!editing">
      {{ typeName }} instances
      <div v-if="instances" class="badge badge-soft badge-primary badge-xl">{{ filteredInstances.length }}</div>
      <button class="btn btn-success btn-soft btn-sm ml-2" @click="createNew()">
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

  <template v-if="editing === undefined && instances">
    <div class="flex gap-3 mb-5">
      <DashboardStateFilterSelector v-model:state="stateFilter" />
      <DashboardEditorFilterSelector v-model:editor="editorFilter" v-if="user.admin" />
      <DashboardSortingSelector v-model:mode="sortMode" />
    </div>

    <div class="flex flex-wrap gap-3 mb-3">
      <template v-for="instance in filteredInstances" :key="instance.id">
        <slot name="previewBody" :instance="instance" :clicked="() => tryEdit(instance)">

        </slot>
      </template>
    </div>

    <div class="text-base-content/70" v-if="hiddenCount > 0">
      ({{ hiddenCount }} hidden instances)
    </div>
  </template>

  <template v-if="editing != null">
    <div class="flex flex-wrap gap-5">
      <div class="flex flex-col gap-3">
        <div class="bg-base-200 w-fit min-w-2xl p-3 rounded-lg">
          <template v-if="!editingIsPast || editingForced">
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
          </template>

          <template v-else>
            <div class="flex flex-col items-center max-w-4xl">
              <GameTitle :gameDef="gameDef" :container="editing" :dashboard="true" />
              <component :is="gameDef.summaryComponent" :container="editing" :reports="editingGameReports" />
              <ContextBox :container="editing as unknown as AnyGameContainer" />
            </div>
          </template>
        </div>

        <div class="flex gap-5">
          <template v-if="!editingIsPast || editingForced">
            <div class="join">
              <button class="btn btn-neutral join-item" @click="cancel">Cancel</button>
              <button class="btn btn-success join-item" @click="save" :disabled="editingErrors.length > 0 || editingExample">Save</button>
            </div>
            <DashboardGameDeleteButton :editing="editing" :typeId="gameDef.id" @deleted="onDelete" />
          </template>

          <template v-else>
            <button class="btn btn-neutral join-item" @click="cancel">Go back</button>
          </template>

          <button class="btn btn-soft btn-info" :disabled="editingErrors.length > 0" @click="startPreview()"><PlayIcon /> Live preview</button>

          <button class="btn btn-soft btn-accent" v-if="user.admin && editingIsPast && !editingForced" @click="editingForced = true">Admin: Edit game</button>
        </div>
      </div>

      <div v-if="editingIsPast">
        <DashboardGameBasicStats :gameReports="editingGameReports" />
      </div>
    </div>
  </template>

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

  <dialog ref="previewModal" id="previewModal" class="modal" v-if="editing && previewOpen" @close="previewOpen = false">
    <div class="modal-box max-w-4xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <div class="badge badge-primary badge-xs" v-if="previewState === GameState.PLAYING">State: Playing</div>
      <div class="badge badge-success badge-xs" v-else-if="previewState === GameState.SUCCEEDED">State: Succeeded</div>
      <div class="badge badge-error badge-xs" v-if="previewState === GameState.FAILED">State: Failed</div>

      <div class="flex flex-col items-center">
        <component :is="gameDef.gameComponent" :key="previewCounter" :state="previewState" :position="1" :container="gameDef.remap(deepCopyReactive(editing))" @onFinish="previewListener" />
        <ContextBox :container="editing as unknown as AnyGameContainer" v-if="previewState !== GameState.PLAYING" />
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