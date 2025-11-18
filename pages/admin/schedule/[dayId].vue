<script setup lang="ts">
import CalendarDaysIcon from "~/components/icons/CalendarDaysIcon.vue";
import {GAMES_PER_DAY, getDashboardData, getFriendlyName, updateScheduleDay} from "~/utils/dashboard";
import {GameState, type PackedDayData, type ScheduleDay, type ScheduleEntry} from "~/types/models";
import NoSymbolIcon from "~/components/icons/NoSymbolIcon.vue";
import ArrowPathIcon from "~/components/icons/ArrowPathIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import {watchOnce} from "@vueuse/shared";
import {findGameById, getGames} from "~/utils/game/clientGameRegistry";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const dashboardData = await getDashboardData()
const todayId = dashboardData.schedule.todayId
const dayId: number = parseInt(useRoute().params.dayId?.toString()!!)
const friendly = await getFriendlyName(dayId, 'LLLL d')
const { data: packedGameData, pending, error, clear } = await useAsyncData<PackedDayData>(dayId + "", () => $fetch("/api/day/" + dayId), { lazy: true })
const editable = computed(() => {
  return packedGameData.value &&
      (dayId > todayId || (dayId === todayId && packedGameData.value.typeIds.length < GAMES_PER_DAY))
})
const games = ref<ScheduleEntry[]>([])
const selectorModal = ref<HTMLDialogElement | null>(null)
const selectingIndex = ref<number | undefined>(undefined)
const selectType = ref<number | undefined>(undefined)
const saving = ref(false)
const savingError = ref<string | undefined>(undefined)

function clearSlot(index: number) {
  if(games.value && games.value[index]) {
    games.value[index].typeId = undefined
    games.value[index].gameData = undefined
  }
}

async function openSelect(typeId: number, index: number) {
  selectType.value = typeId
  selectingIndex.value = index
  await nextTick()
  selectorModal.value?.showModal()
}

function selected(typeId: number, ins: any) {
  if(selectingIndex.value !== undefined && games.value) {
    games.value[selectingIndex.value]!!.typeId = typeId
    games.value[selectingIndex.value]!!.gameData = ins
    selectorModal.value?.close()
    selectingIndex.value = undefined
    selectType.value = undefined
  }
}

async function save() {
  saving.value = true

  const dayData = <ScheduleDay>{
    day: dayId,
    dayFriendly: friendly,
    gameIds: games.value!!.map(g => g.gameData?.id).filter(t => t !== undefined) as number[],
    typeIds: games.value!!.map(g => g.typeId).filter(t => t !== undefined) as number[]
  }

  try {
    if(dayData.typeIds.length > 0) {
      await updateScheduleDay(dayData)
    }

    clear()
    navigateTo('/admin/schedule')
  } catch (e: any) {
    savingError.value = e.message
  } finally {
    saving.value = false
  }
}

function cancel() {
  navigateTo('/admin/schedule')
}

function modalClosed() {
  selectingIndex.value = undefined
  selectType.value = undefined
}

watchOnce(packedGameData, (data) => {
  if(data) {
    // seems to be well-defined already, just fill
    for (let i = 0; i < data.typeIds.length; i++) {
      const typeId = data.typeIds[i]
      const gameData = data.data[i]
      const gameDef = typeId ? findGameById(typeId) : undefined

      games.value.push({
        typeId,
        gameDef,
        gameData
      })
    }
  }

  const times = GAMES_PER_DAY - games.value.length

  for(let i = 0; i < times; i++) {
    games.value.push({
      typeId: undefined,
      gameDef: undefined,
      gameData: undefined
    })
  }
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold">
    <span class="text-primary"><CalendarDaysIcon class="size-8" /></span>
    Schedule for {{ friendly }}
  </div>

  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div class="w-full" v-if="games">
    <div class="stats stats-vertical border-1 border-neutral/50 my-8 w-full">

      <div class="stat" v-for="(game, index) in games" :key="index">
        <div class="stat-title">Game {{ index + 1 }}</div>
        <div class="stat-value flex items-center gap-2" v-if="game.gameDef">
          <component :is="game.gameDef.icon" :state="GameState.UPCOMING" />
          {{ game.gameDef.getSpacedName() }}
        </div>

        <div class="relative group w-fit" v-if="game.typeId">
          <DashboardGamePreview :typeId="game.typeId!!" :instance="game.gameData" />

          <div v-if="editable" class="absolute z-10 inset-0 backdrop-blur-sm rounded-lg bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button class="btn btn-secondary btn-outline" @click="clearSlot(index)">
              <NoSymbolIcon />
              Clear
            </button>
            <button class="btn btn-secondary btn-outline" @click="openSelect(game.typeId!!, index)">
              <ArrowPathIcon />
              Select other
            </button>
          </div>
        </div>

        <template v-else>
          <div class="mt-2" v-if="editable">
            <button class="btn btn-primary btn-soft" :popovertarget="'popover-' + index" :style="'anchor-name:--anchor-' + index">
              <PlusIcon /> Add
            </button>
            <ul class="dropdown menu rounded-box bg-base-300 shadow-sm"
                popover :id="'popover-' + index" :style="'position-anchor:--anchor-' + index"
                :class="{'dropdown-top': index >= 2}">
              <li v-for="[_, comp] of Object.entries(getGames())" :key="comp.id">
                <a @click="openSelect(comp.id, index)">
                  <component :is="comp.icon" :state="GameState.UPCOMING" />
                  {{ comp.getSpacedName() }}
                </a>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>

    <div class="alert alert-error" v-if="savingError">
      {{ savingError }}
    </div>

    <button class="btn btn-soft btn-lg mr-2" @click="cancel()">
      Cancel
    </button>
    <button class="btn btn-success btn-soft btn-lg" v-if="packedGameData && !saving && editable" @click="save()">
      Save
    </button>
    <button class="btn btn-sucess btn-soft btn-lg" disabled v-else-if="saving">
      <span class="loading loading-spinner"></span> Saving
    </button>
  </div>

  <dialog ref="selectorModal" id="selectorModal" class="modal" v-if="selectType" @close="modalClosed()">
    <div class="modal-box max-w-[600px] overflow-x-hidden">
      <DashboardSelectGame :typeId="selectType" @select="ins => selected(ins.typeId!!, ins.data!!)" />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dropdown.open-up {
  transform-origin: bottom;
  translate: 0 calc(-100% - 0.5rem);
}
</style>