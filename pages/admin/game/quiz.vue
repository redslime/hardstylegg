<script setup lang="ts">
import CheckCircle from "~/components/icons/game/CheckCircle.vue";
import {type QuizContainer} from "~/types/gameModels";
import {validateQuiz} from "~/utils/gameValidators"
import {getQuizData} from "~/utils/dashboard";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<QuizContainer[]>(() => getQuizData(), { lazy: true })
const instances = computed<QuizContainer[] | undefined>(() => data.value)
const editing = ref<QuizContainer | undefined>()
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :validator="() => validateQuiz(editing!!)"
        :editUrl="'/api/dashboard/edit/quiz'"
        :typeId="7"
        :typeName="'Quiz'"
        :icon="CheckCircle"
        :title="t => t.title"
    >
      <template #previewBody="{ instance }">
        <div v-for="item in instance.items" :key="item.id" class="badge badge-outline"
             :class="{
              'badge-success': item.correct,
              'badge-error': !item.correct
            }">
          {{ item.text }}
        </div>
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Quiz title" required maxlength="128"
               class="input input-lg validator w-[80ch] focus:outline-none focus:ring-0"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
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
      </template>
    </DashboardGameEditor>
  </div>
</template>