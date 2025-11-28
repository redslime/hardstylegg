<script setup lang="ts">
import {type Editor} from "~/types/models";
import {getDashboardData} from "~/utils/dashboard";

const editors = (await getDashboardData()).editors
const editor = defineModel<Editor | undefined>('editor', { required: true })

function change(clicked: Editor | undefined) {
  editor.value = clicked
  document.activeElement?.blur()
}
</script>

<template>
  <fieldset class="fieldset min-w-30">
    <legend class="fieldset-legend">Editor filter</legend>
    <div class="dropdown">
      <div tabindex="0" role="button" class="select cursor-pointer">
        {{ editor ? editor.name : "everyone" }}
      </div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-10 w-52 p-2 shadow-sm">
        <li @click="change(undefined)"><a>everyone</a></li>
        <li v-for="editor in editors.filter(e => e.discord_id !== '-1')" :key="editor.id" @click="change(editor)">
          <a>
            {{ editor.name }}
          </a>
         </li>
      </ul>
    </div>
  </fieldset>
</template>

<style scoped>

</style>