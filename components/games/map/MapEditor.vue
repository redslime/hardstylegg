<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import MapPreview from "~/components/games/map/MapPreview.vue";
import CountryMap, {type HighlightItem} from "~/components/games/map/CountryMap.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry, $countries } = useNuxtApp();
const gameDef = $gameRegistry.MapDef
const { data, pending, error } = await useAsyncData<MapContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<MapContainer[] | undefined>()
const editing = ref<MapContainer | undefined>()
const selected = ref<HighlightItem[]>([])
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

watchOnce(data, () => instances.value = data.value)
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
        <CountryMap v-model:highlighted="selected" @click="s => clicked(s)">
          <div class="absolute bottom-2 flex justify-center w-full z-500">
            <div class="badge md:badge-lg badge-info" v-if="editing.goal">Selected: {{ countryName }}</div>
          </div>
        </CountryMap>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>