<script setup lang="ts">
import type {QuizAnswer} from "~/types/gameModels";
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";

const item = defineModel<QuizAnswer>('item', { required: true })
const hasContext = computed<boolean>(() => (item.value.context?.trim().length ?? 0) > 0)
const forceContext = ref<boolean>(false)
const emit = defineEmits<{ delete: [] }>()

function del() {
  emit("delete")
}
</script>

<template>
  <div class="flex gap-2">
    <div class="join join-vertical">
      <div class="join-item">
        <label class="input min-w-[64ch]" :class="{'rounded-b-none': hasContext || forceContext}">
          <span v-if="item.correct" class="badge badge-success badge-xs min-w-10 cursor-pointer z-1000"
            @click="item.correct=!item.correct">True</span>
          <span v-else class="badge badge-error badge-xs min-w-10 cursor-pointer z-1000"
                @click="item.correct=!item.correct">False</span>
          <input type="text" class="font-medium" maxlength="64" placeholder="Answer option" required v-model="item.text" />
        </label>
      </div>
      <div class="join-item" v-if="hasContext || forceContext">
        <label class="input min-w-[64ch] rounded-t-none">
          <span class="label text-base-content mr-1">
            <LightBulbIcon :class="{'text-info': hasContext, 'text-gray-500': !hasContext}" />
            <span v-if="!hasContext">Context</span>
          </span>
          <input type="text" class="text-base-content/80" v-model="item.context" />
        </label>
      </div>
    </div>

    <button class="btn btn-error btn-outline px-3 tooltip" @click="del()" data-tip="Remove answer">X</button>
    <button class="btn btn-info btn-outline px-1 tooltip" data-tip="Edit context" @click="forceContext = true" v-if="!hasContext && !forceContext">
      <LightBulbIcon />
    </button>
  </div>
</template>

<style scoped>

</style>