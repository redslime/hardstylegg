<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import MapPreview from "~/components/games/map/MapPreview.vue";
import type {HighlightItem} from "~/components/games/map/CountryMap.vue";
import {MapDef} from "~/utils/game/clientGameRegistry";

const gameDef = MapDef
const { data, pending, error } = await useAsyncData<MapContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = computed<MapContainer[] | undefined>(() => data.value)
const editing = ref<MapContainer | undefined>()
const selected = ref<HighlightItem[]>([])
const { $countries } = useNuxtApp();
const countryName = computed(() => $countries.getName(editing.value?.goal ?? "", "en"))

function clicked(country: string) {
  selected.value = [
    {
      iso2: country,
      color: "#fd9c2c",
    }
  ]
  editing.value!!.goal = country
}

watch(editing, (val) => {
  if(val) {
    selected.value = [{ iso2: val.goal, color: "#fd9c2c" }]
  }
})
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
    >
      <template #previewBody="{ instance, clicked }">
        <MapPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Title" required maxlength="128"
               class="input input-lg validator w-[80ch]"
               v-model="editing!!.title" />
      </template>

      <template #editBody v-if="editing">
        <CountryMap v-model:highlighted="selected" @click="s => clicked(s)" />
        <div v-if="editing.goal">
          Selected: {{ countryName }}
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>