<script setup lang="ts">
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";
import ContextMdEditor from "~/components/dashboard/ContextMdEditor.vue";

const input = defineModel<string | undefined | null>('input', { required: true })
const markdown = ref<string>(input.value ?? '')
const hasInput = computed(() => (input.value?.trim().length ?? 0) > 0)
const opened = ref<boolean>(hasInput.value)
const { hasItems } = defineProps({
  hasItems: { type: Boolean, default: false }
})

watch(markdown, () => input.value = markdown.value)
</script>

<template>
  <div class="collapse collapse-arrow bg-base-100 border-base-300 border my-5">
    <input type="checkbox" v-model="opened" />
    <div class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12 flex gap-1">
      <LightBulbIcon :class="{'text-info': hasInput, 'text-gray-500': !hasInput}" />
      Context
    </div>
    <div class="collapse-content text-sm">
      <fieldset class="fieldset">
        <div v-if="hasItems">
          This context field is intended for the entire question. You can add contexts for individual items above.
        </div>
        <ContextMdEditor v-model:markdown="markdown" />
        <div class="label">The context is shown after the game has been played.</div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>

</style>