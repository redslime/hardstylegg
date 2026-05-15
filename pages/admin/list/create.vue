<script setup lang="ts">
import ListNumberedIcon from "~/components/icons/ListNumberedIcon.vue";
import type {List, ListType} from "~/types/models";
import ListEditor from "~/components/dashboard/list/ListEditor.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { user } = useUserSession()
const list = ref<List | undefined>()
const type = computed<ListType | undefined>(() => list.value?.type)

function setupList(type: ListType) {
  list.value = <List>{
    id: 0,
    createdBy: user.value.id,
    type,
    name: "Click to edit list name",
    description: undefined,
    icon: undefined,
    items: [],
  }
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-4" v-if="!list">
    <span class="text-primary"><ListNumberedIcon class="size-8" /></span>
    Create new<span v-if="type"> {{ type }}</span> list
  </div>

  <div class="bg-base-300 rounded-xl p-5 w-fit mt-6" v-if="type === undefined">
    <p class="text-xl font-bold">
      Select list type:
    </p>

    <div class="flex flex-col gap-2 mt-4">
      <button class="btn btn-primary btn-soft" @click="setupList('track')">Tracks</button>
      <button class="btn btn-primary btn-soft" @click="setupList('album')">Albums</button>
      <button class="btn btn-primary btn-soft" @click="setupList('artist')">Artists</button>
    </div>
  </div>

  <template v-if="list">
    <ListEditor v-model:list="list" />
  </template>
</template>

<style scoped>

</style>