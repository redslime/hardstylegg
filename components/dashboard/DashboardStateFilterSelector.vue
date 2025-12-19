<script setup lang="ts">
import {StateFilter} from "~/types/models";

const state = defineModel<StateFilter>('state', { required: true })
const { disabled } = defineProps({
  disabled: { type: Boolean, default: false }
})

function getStyle(state: StateFilter): string {
  switch (state) {
    case StateFilter.ALL: return 'status-primary'
    case StateFilter.UPCOMING: return 'status-success'
    case StateFilter.PAST: return 'status-warning'
    default: return 'invalid'
  }
}

function change(clicked: StateFilter) {
  document.activeElement?.blur()

  if(!disabled) {
    state.value = clicked
  }
}
</script>

<template>
  <fieldset class="fieldset min-w-30">
    <legend class="fieldset-legend">State filter</legend>
    <div class="dropdown" :class="{'pointer-events-none': disabled}">
      <div tabindex="0" role="button" class="select cursor-pointer" v-bind="disabled ? { disabled: true } : {}">
        <div class="status" :class="getStyle(state as StateFilter)"></div>
        {{ state }}
      </div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-10 w-52 p-2 shadow-sm">
        <li v-for="state in Object.values(StateFilter).filter(s => s !== state)" :key="state" @click="change(state as StateFilter)">
          <a>
            <div class="status" :class="getStyle(state as StateFilter)"></div>
            {{ state }}
          </a>
         </li>
      </ul>
    </div>
  </fieldset>
</template>

<style scoped>

</style>