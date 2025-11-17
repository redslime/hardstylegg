<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import {getMapData} from "~/utils/dashboard";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateMap} from "~/utils/gameValidators";
import MapIcon from "~/components/icons/game/MapIcon.vue";
import MapPreview from "~/components/dashboard/preview/MapPreview.vue";
import type {HighlightItem} from "~/components/CountryMap.vue";
import {getName} from "i18n-iso-countries"

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<MapContainer[]>(() => getMapData(), { lazy: true })
const instances = computed<MapContainer[] | undefined>(() => data.value)
const editing = ref<MapContainer | undefined>()
const selected = ref<HighlightItem[]>([])

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
        :validator="() => validateMap(editing!!)"
        :editUrl="'/api/dashboard/edit/map'"
        :typeId="10"
        :typeName="'Map'"
        :icon="MapIcon"
        :title="t => t.title"
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
          Selected: {{ getName(editing.goal, "en") }}
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>