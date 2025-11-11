<script setup lang="ts">
import type {ScheduleDay} from "~/types/models";
import {getScheduleForGame} from "~/utils/dashboard";

const emit = defineEmits(['deleted'])
const { user } = useUserSession()
const confirmed = ref<boolean>(false)
const deletingModal = ref<HTMLDialogElement | undefined>()
const deletingResponse = ref<boolean | undefined>()
const { editing, typeId } = defineProps({
  editing: { type: Object as PropType<{ id?: number, created_by?: number }>, required: true },
  typeId: { type: Number , required: true },
})
const scheduleData = computed<ScheduleDay | undefined>(() => getScheduleForGame(typeId, editing?.id))
const disabled = computed<boolean>(() => scheduleData.value !== undefined)
const example = computed<boolean>(() => editing?.id === 1)

function canDelete(): boolean {
  return (editing?.created_by === user.value.id || user.value.admin) && editing?.id !== undefined && !example.value
}

function showModal() {
  confirmed.value = false
  deletingResponse.value = undefined
  deletingModal.value?.showModal()
}

async function del() {
  confirmed.value = true

  try {
    const data = await $fetch('/api/dashboard/deleteInstance', {
      method: 'POST',
      body: {
        typeId,
        gameId: editing?.id,
      }
    })

    if(data) {
      emit('deleted', data)
      deletingResponse.value = true
      deletingModal.value?.close()
      return
    }
  } catch (e) {
    deletingResponse.value = false
  }
}
</script>

<template>
  <button class="btn btn-error" v-if="canDelete() && !disabled" @click="showModal()">Delete</button>

  <div class="tooltip" v-if="canDelete() && disabled" data-tip="Can't delete scheduled games">
    <button class="btn btn-error tooltip" :disabled="true">Delete</button>
  </div>

  <dialog ref="deletingModal" id="deletingModal" class="modal">
    <div class="modal-box" v-if="!confirmed">
      <div class="text-xl font-bold text-center">
        Are you sure you want to delete?
      </div>
      <div class="flex justify-center mt-5 gap-3">
        <button class="btn btn-outline btn-lg btn-error" @click="del()">Delete</button>
        <button class="btn btn-neutral btn-lg" @click="deletingModal?.close()">Cancel</button>
      </div>
    </div>
    <div v-else>
      <div class="modal-box" v-if="deletingResponse === undefined">
        <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Deleting...</h3>
      </div>
      <div class="modal-box" v-else-if="deletingResponse">
        <h3 class="text-xl font-bold text-center">Deleted successfully</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <div class="modal-box" v-else>
        <h3 class="text-xl font-bold text-center text-error">Error</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>