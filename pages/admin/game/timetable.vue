<script setup lang="ts">
import type {TimetableContainer, TimetableItem} from "~/types/gameModels";
import {getTimetableData} from "~/utils/dashboard";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateTimetable, validateTimetableItem} from "~/utils/gameValidators";
import PencilSquare from "~/components/icons/game/PencilSquare.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import {Vue3ColorPicker} from '@cyhnkckali/vue3-color-picker';
import '@cyhnkckali/vue3-color-picker/dist/style.css';
import TimetablePreview from "~/components/dashboard/preview/TimetablePreview.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<TimetableContainer[]>(() => getTimetableData(), { lazy: true })
const instances = computed<TimetableContainer[] | undefined>(() => data.value)
const editing = ref<TimetableContainer | undefined>()
const editingItem = ref<TimetableItem | undefined>()
const actModal = ref<HTMLDialogElement | null>()
const showBgPicker = ref(false)
const showTextPicker = ref(false)

const editingItemErrors = computed<string[]>(() => {
  if (!editingItem.value) return []

  const errors: string[] = []
  validateTimetableItem(editingItem.value, errors)
  return errors
})

async function edit(item: TimetableItem) {
  editingItem.value = item
  await nextTick()
  actModal.value?.showModal()
}

async function add() {
  const lastEnd = editing.value!!.items.length > 0 ? editing.value!!.items[editing.value!!.items.length - 1]?.end ?? "00:00" : "00:00"
  const end = addOneHour(lastEnd)

  if(editing.value!!.items.length === 0) {
    editing.value!!.items.push({name: "", begin: "12:00", end: "13:00", hidden: false})
    editing.value!!.color_bg = "#3ABDF8"
    editing.value!!.color_text = "#010D15"
  } else {
    editing.value!!.items.push({name: "", begin: lastEnd, end: end, hidden: false})
  }

  editingItem.value = editing.value!!.items[editing.value!!.items.length - 1]
  await nextTick()
  actModal.value?.showModal()
}

function del() {
  if (!editingItem.value) return
  editing.value!.items.splice(editing.value!!.items.indexOf(editingItem.value), 1)
  actModal.value?.close()
  editingItem.value = undefined
}

function addOneHour(time: string): string {
  const [hours, minutes] = time.split(":")
  const newHours = (parseInt(hours!) + 1) % 24
  const hoursPadded = newHours.toString().length === 1 ? `0${newHours}` : newHours
  const newMinutes = minutes!.length === 1 ? `0${minutes}` : minutes
  return `${hoursPadded}:${newMinutes}`
}

function hidePicker() {
  showBgPicker.value = false
  showTextPicker.value = false
}
</script>
<script lang="ts">
import clickOutside from "~/utils/clickOutside";

export default {
  directives: {
    clickOutside
  },
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :validator="() => validateTimetable(editing!!)"
        :editUrl="'/api/dashboard/edit/timetable'"
        :typeId="9"
        :typeName="'Timetable'"
        :icon="PencilSquare"
        :title="t => t.title"
    >
      <template #previewBody="{ instance, clicked }">
        <TimetablePreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Timetable title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
        <TimetableGenerator :container="editing" :items="editing.items">
          <template #default="{ item }">
            <div class="w-full h-full cursor-pointer" @click="edit(item)">
              <div class="text-lg font-bold">
                {{ item.name }}
                <span class="badge badge-info badge-sm" v-if="item.hidden">Hidden</span>
              </div>
              <div class="text-xs opacity-80">
                {{ item.begin }} - {{ item.end }}
              </div>
            </div>
          </template>
        </TimetableGenerator>

        <p class="mt-5 opacity-80 flex gap-1">
          <InfoIcon class="text-info" />
          Click on individual entries to edit them.
        </p>
        <button class="btn btn-soft btn-primary mt-5" @click="add()">Add entry</button>

        <div class="mt-5 w-fit" v-if="editing.items.length > 0">
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 relative">
              <div class="w-10 h-10 rounded-full cursor-pointer" @click.stop="hidePicker(); showBgPicker = true" :style="{ backgroundColor: editing.color_bg }"></div>
              Edit body color

              <div class="absolute -top-36 -right-40 z-10" v-if="showBgPicker" v-click-outside="hidePicker" >
                <Vue3ColorPicker v-model="editing.color_bg" :mode="'solid'" :theme="'dark'" :type="'HEX'" :showPickerMode="false" :showColorList="false" :showAlpha="false" />
              </div>
            </div>
            <div class="flex gap-2 relative">
              <div class="w-10 h-10 rounded-full cursor-pointer" @click.stop="hidePicker(); showTextPicker = true" :style="{ backgroundColor: editing.color_text }"></div>
              Edit text color

              <div class="absolute -top-36 -right-40 z-10" v-if="showTextPicker" v-click-outside="hidePicker">
                <Vue3ColorPicker v-model="editing.color_text" :mode="'solid'" :theme="'dark'" :type="'HEX'" :showPickerMode="false" :showColorList="false" :showAlpha="false" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </DashboardGameEditor>
  </div>

  <dialog ref="actModal" id="actModal" class="modal" v-if="editingItem">
    <div class="modal-box">
      <h3 class="text-lg font-bold mb-3">Edit timetable entry</h3>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Name</legend>
        <input type="text" class="input focus:outline-none focus:ring-0" placeholder="Act name" required maxlength="128" v-model="editingItem.name" />

        <div class="flex gap-6 mt-2 items-center">
          <div>
            <input type="time" class="input focus:outline-none focus:ring-0 w-24" placeholder="Start time" required :disabled="editing!!.items.length > 1" v-model="editingItem.begin" />
          </div>
          until
          <div>
            <input type="time" class="input focus:outline-none focus:ring-0 w-24" @keyup.enter="editingItem = undefined; actModal?.close()" placeholder="End time" required v-model="editingItem.end" />
          </div>
        </div>

        <label class="flex label mt-2">
          <input v-model="editingItem.hidden" class="checkbox checkbox-success" type="checkbox" />
          Hidden
        </label>
      </fieldset>

      <div class="mt-5">
        <div class="text-error" v-for="error in editingItemErrors" :key="error">
          {{ error }}.
        </div>
        <button class="btn btn-success mr-2" :disabled="editingItemErrors.length > 0" @click="editingItem = undefined; actModal?.close()">Save</button>
        <button class="btn btn-error" @click="del">Delete</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>