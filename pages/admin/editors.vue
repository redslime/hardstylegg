<script setup lang="ts">
import UsersIcon from "~/components/icons/UsersIcon.vue";
import {getDashboardData} from "~/utils/dashboard";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const dashboardData = await getDashboardData()
const editors = dashboardData.editors
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><UsersIcon class="size-8" /></span>
    Editors
  </div>

  <div class="overflow-x-auto" v-if="editors">
    <table class="table">
      <!-- head -->
      <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Discord ID</th>
        <th>Admin</th>
      </tr>
      </thead>
      <tbody>
      <!-- row 1 -->
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

<style scoped>

</style>