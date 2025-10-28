<script setup lang="ts">
import UsersIcon from "~/components/icons/UsersIcon.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated-admin'],
})

const {data: editors, pending, error} = await useAsyncData(() => $fetch('/api/dashboard/editors'), { lazy: true })
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold">
    <span class="text-primary"><UsersIcon class="size-8" /></span>
    Editors
  </div>

  <span class="loading loading-spinner loading-xl" v-if="pending"></span>

  <div role="alert" class="alert alert-error alert-soft" v-if="error">
    <span>Failed to load editors</span>
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