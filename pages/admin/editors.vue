<script setup lang="ts">
import UsersIcon from "~/components/icons/UsersIcon.vue";
import {getDashboardData} from "~/utils/dashboard";
import type {Editor} from "~/types/models";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const dashboardData = await getDashboardData()
const editors = dashboardData.editors

const adding = ref<boolean>(false)
const processing = ref<boolean>(false)
const newUser = ref<Editor>({
  id: -1,
  name: "",
  discord_id: "",
  admin: false
})
const newUserValid = computed(() => {
  return newUser.value.name.trim().length > 0 && newUser.value.discord_id.trim().length === 18
})

async function addUser() {
  processing.value = true

  try {
    const fetched = await $fetch<Editor>('/api/dashboard/edit/editor', {
      method: "POST",
      body: newUser.value
    })
    dashboardData.editors.push(fetched)
  } catch (e: any) {
    alert("Failed to create editor: " + e.message)
  } finally {
    processing.value = false
    adding.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><UsersIcon class="size-8" /></span>
    Editors
    <button class="btn btn-success btn-soft btn-sm ml-2" v-if="user.admin && !adding" @click="adding = true">
      Add
    </button>
  </div>

  <template v-if="!adding">
    <div class="overflow-x-auto" v-if="editors">
      <table class="table">
        <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Discord ID</th>
          <th>Admin</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(editor, index) in editors" :key="index">
          <th>{{ editor.id }}</th>
          <td>{{ editor.name }}</td>
          <td>{{ editor.discord_id }}</td>
          <td>{{ editor.admin }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>
  <template v-else>
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend class="fieldset-legend">New editor</legend>

      <label class="label">Name</label>
      <input type="text" class="input" v-model="newUser.name" :disabled="processing" />

      <label class="label">Discord ID</label>
      <input type="text" class="input" v-model="newUser.discord_id" :disabled="processing" />

      <label class="label">
        <input type="checkbox" class="checkbox" v-model="newUser.admin" :disabled="processing" />
        Admin
      </label>

      <button class="btn btn-soft btn-success mt-5 w-fit" :disabled="!newUserValid" @click="addUser()" v-if="!processing">
        Add
      </button>
      <button class="btn btn-soft btn-successs mt-5 w-fit" disabled v-else>
        <span class="loading loading-spinner"></span>
      </button>
    </fieldset>
  </template>
</template>

<style scoped>

</style>