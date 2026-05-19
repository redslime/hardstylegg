<script setup lang="ts">
import {RichArtist} from "~/types/content";
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";

const item = defineModel<RichArtist>('item', { required: true })
const context = defineModel<string | undefined>('context', { required: true })
const { editing: listEditing } = defineProps({
  editing: { type: Boolean, default: false }
})
const emit = defineEmits<{ remove: [] }>()

const force = ref<boolean>(false)
const editing = ref<boolean>(false)

function tryEdit() {
  if(listEditing) {
    editing.value = true
  }
}

watch(context, val => {
  if(val && val === '') {
    context.value = undefined
  }
})
</script>

<template>
  <div class="rounded-lg shadow p-2 border border-neutral/50 transition-colors flex items-center">
    <div class="flex flex-col gap-3">
      <div class="flex justify-start items-center gap-2">
        <img class="size-16 rounded-full" :src="item.getImageUrl()" :alt="item.getDisplayName()" />
        <div class="flex flex-col">
          <div class="text-sm font-semibold">{{ item.getDisplayName() }}</div>

          <div class="bg-base-300 rounded-md border border-info w-fit indicator pl-3.5 pr-1 whitespace-pre-line ml-2 mt-2"
               :class="{'cursor-pointer': listEditing}"
               @click="tryEdit()" v-if="context || force">
            <span class="indicator-item indicator-middle indicator-start badge badge-info rounded-full px-0">
              <LightBulbIcon :size="'size-4'" />
            </span>
            <p class="text-sm" v-if="context && !editing">
              {{ context }}
            </p>

            <input class="input input-sm border-0" type="text" v-model="context" placeholder="Context" v-if="editing"
                   @keydown.enter="editing = false; force = false" @blur="editing = false; force = false" maxlength="1024" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="absolute -top-2 -right-2 flex gap-1" v-if="listEditing">
    <div class="badge badge-info cursor-pointer px-1 tooltip" :class="{'badge-outline': !context}" @click="force = true; editing = true" data-tip="Add context"><LightBulbIcon /></div>
    <div class="badge badge-error cursor-pointer tooltip" data-tip="Remove item" @click="emit('remove')">X</div>
  </div>
</template>

<style scoped>

</style>