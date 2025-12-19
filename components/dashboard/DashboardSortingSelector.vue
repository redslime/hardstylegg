<script setup lang="ts">
import {SortMode} from "~/types/models";

const mode = defineModel<SortMode>('mode', { required: true })
const { disabled } = defineProps({
  disabled: { type: Boolean, default: false }
})

function change(clicked: SortMode) {
  document.activeElement?.blur()

  if(!disabled) {
    mode.value = clicked
  }
}
</script>

<template>
  <fieldset class="fieldset min-w-30">
    <legend class="fieldset-legend">Sort by</legend>
    <div class="dropdown" :class="{'pointer-events-none': disabled}">
      <div tabindex="0" role="button" class="select cursor-pointer" v-bind="disabled ? { disabled: true } : {}">
        {{ mode }}
      </div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-10 w-52 p-2 shadow-sm">
        <li v-for="state in Object.values(SortMode).filter(s => s !== mode)" :key="state" @click="change(state as SortMode)">
          <a>
            {{ state }}
          </a>
         </li>
      </ul>
    </div>
  </fieldset>
</template>

<style scoped>

</style>