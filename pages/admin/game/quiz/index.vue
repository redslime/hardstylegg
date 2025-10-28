<script setup lang="ts">
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import {type QuizContainer, validateQuiz} from "~/types/gameModels";
import {deepCopy} from "~/utils/utils";
import {getQuizData} from "~/utils/dashboard";
import DashboardGameDeleteButton from "~/components/dashboard/DashboardGameDeleteButton.vue";
import DashboardQuizPreview from "~/components/dashboard/DashboardQuizPreview.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const instances = await getQuizData()
const savingModal = ref<HTMLDialogElement | undefined>()
const editing = ref<QuizContainer | undefined>()
const savingResponse = ref<boolean | String[] | undefined>()
const editingErrors = computed<string[]>(() => {
  if(editing.value !== undefined) {
    return validateQuiz(editing.value!!)
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
    const quiz = editing.value!!
    quiz.created_by = user.value.id

    const { data, error } = await useFetch<String[] | QuizContainer>('/api/dashboard/edit/quiz', {
      method: 'POST',
      body: quiz
    })

    if(error.value) {
      savingResponse.value = [error.value.message]
      return
    } else {
      if(data.value) {
        if(!Array.isArray(data.value)) {
          const fetchedQuiz = data.value
          instances.splice(0, instances.length, ...instances!!.filter(i => i.id !== fetchedQuiz.id));
          instances.push(fetchedQuiz)
          instances.sort((a, b) => (a.id ?? 100) - (b.id ?? 100))
          savingResponse.value = true
          editing.value = undefined
          savingModal.value?.close()
          return
        } else {
          savingResponse.value = data.value
          return
        }
      }
    }
  }

  savingResponse.value = ["Invalid editing state"]
}

function onDelete(quiz: QuizContainer) {
  instances.splice(0, instances.length, ...instances!!.filter(i => i.id !== quiz.id));
  editing.value = undefined
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CheckCircle class="size-8" /></span>
    <div v-if="!editing">
      Quiz instances
      <div v-if="instances" class="badge badge-soft badge-primary badge-xl">{{ instances.length }}</div>
      <button class="btn btn-success btn-soft btn-sm ml-2" @click="editing=deepCopy({title: '', items: []})">
        Create new
      </button>
    </div>
    <div v-else-if="editing.id !== undefined">
      Editing quiz instance with <span class="font-mono">id={{ editing.id }}</span>
    </div>
    <div v-else>
      Creating new quiz instance
    </div>
  </div>

  <div class="flex flex-wrap gap-3" v-if="editing === undefined && instances">
    <template v-for="quiz in instances" :key="quiz.id">
      <DashboardQuizPreview :quiz="quiz" @clicked="editing = deepCopy(quiz)" />
    </template>
  </div>

  <div class="flex flex-col gap-3" v-if="editing != null">
    <div class="bg-base-200 w-fit p-3 rounded-lg">
      <div class="font-bold mb-4">
        <input type="text" placeholder="Quiz title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
               v-model="editing.title" />
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="(item, index) in editing.items" :key="item.id">
          <label class="input min-w-[64ch] validator focus-within:outline-none focus-within:ring-0">
          <span v-if="item.correct" class="badge badge-success badge-xs min-w-[40px] join-item cursor-pointer"
                @click="item.correct=!item.correct">True</span>
            <span v-else class="badge badge-error badge-xs min-w-[40px] join-item cursor-pointer"
                  @click="item.correct=!item.correct">False</span>
            <input type="text" maxlength="64" placeholder="Answer option" required v-model="item.text" />
          </label>
        <button class="ml-2 btn btn-error btn-outline" @click="editing.items.splice(index, 1)">X</button>
        </div>
      </div>
      <button v-if="editing.items.length < 10" class="btn btn-soft btn-success mt-4" @click="editing.items.push({text: '', correct: false})">
        Add answer option
      </button>
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
      <DashboardGameDeleteButton :editing="editing" :typeId="7" @deleted="onDelete" />
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