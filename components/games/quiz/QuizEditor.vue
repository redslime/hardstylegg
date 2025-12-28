<script setup lang="ts">
import {type QuizContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import QuizPreview from "~/components/games/quiz/QuizPreview.vue";
import {watchOnce} from "@vueuse/shared";
import ContextField from "~/components/ContextField.vue";
import QuizEditorItemLine from "~/components/games/quiz/QuizEditorItemLine.vue";

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
               class="input input-lg w-[80ch]"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
        <div class="flex flex-col gap-2">
          <div v-for="(item, index) in editing.items" :key="index">
            <QuizEditorItemLine v-model:item="editing.items[index]!!" @delete="editing.items.splice(index, 1)" />
          </div>
        </div>

        <button v-if="editing.items.length < 10" class="btn btn-soft btn-success mt-4" @click="editing.items.push({text: '', correct: false, context: null})">
          Add answer option
        </button>

        <ContextField v-model:input="editing.context" :hasItems="true" />
      </template>
    </DashboardGameEditor>
  </div>
</template>