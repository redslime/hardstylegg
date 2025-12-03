<script setup lang="ts">
import {type QuizContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import QuizPreview from "~/components/games/quiz/QuizPreview.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.QuizDef
const { data, pending, error } = await useAsyncData<QuizContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<QuizContainer[] | undefined>()
const editing = ref<QuizContainer | undefined>()

watchOnce(data, () => instances.value = data.value)
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
    >
      <template #previewBody="{ instance, clicked }">
        <QuizPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Title" required maxlength="128"
               class="input input-lg validator w-[80ch]"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
        <div class="flex flex-col gap-2">
          <div v-for="(item, index) in editing.items" :key="item.id">
            <label class="input min-w-[64ch] validator">
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