<script setup lang="ts">
import type {MapContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import MapPreview from "~/components/games/map/MapPreview.vue";
import {watchOnce} from "@vueuse/shared";
import BeneluxMap from "~/components/games/map/BeneluxMap.vue";
import {CountryHighlightMapItem, EventHighlightMapItem, type HighlightMapItem} from "~/utils/game/impl/ClientMapGame";
import CountryMap from "~/components/games/map/CountryMap.vue";
import MapIcon from "~/components/games/map/MapIcon.vue";
import PinIcon from "~/components/icons/PinIcon.vue";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.MapDef
const { data, pending, error } = await useAsyncData<MapContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<MapContainer[] | undefined>()
const editing = ref<MapContainer | undefined>()
const selected = ref<HighlightMapItem | undefined>()
const init = ref<HighlightMapItem | undefined>()
const selectedName = computed<string | undefined>(() => selected.value?.displayName())

function clicked(item: HighlightMapItem) {
  if(editing.value) {
    selected.value = item
    item.setGoal(editing.value)
  }
}

function selectCountryMap() {
  if(editing.value) {
    editing.value.type = 'countries'
  }
}

function selectEventMap() {
  if(editing.value) {
    editing.value.type = 'events'
  }
}

function reset() {
  selected.value = undefined
  init.value = undefined
}

watch(editing, (val) => {
  if(val) {
    init.value = gameDef.getHighlightMapItem(val)
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
        @saved="reset()"
        @cancelled="reset()"
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
        <div class="bg-base-300 w-fit p-4 border border-white/10 rounded-md" v-if="!editing.type">
          <h3 class="text-lg font-bold mb-2 text-center">Select map</h3>
          <div class="flex gap-3">
            <button class="btn btn-primary btn-soft" @click="selectCountryMap()"><MapIcon /> Countries</button>
            <button class="btn btn-primary btn-soft" @click="selectEventMap()"><PinIcon /> Events</button>
          </div>
        </div>

        <CountryMap :init="init as CountryHighlightMapItem" @click="item => clicked(item)" v-if="editing.type === 'countries'">
          <div class="absolute bottom-2 flex justify-center w-full z-500">
            <div class="badge md:badge-lg badge-info" v-if="selectedName">Selected: {{ selectedName }}</div>
          </div>
        </CountryMap>

        <BeneluxMap :init="init as EventHighlightMapItem" @click="item => clicked(item)" v-if="editing.type === 'events'">
          <div class="absolute bottom-2 flex justify-center w-full z-500">
            <div class="badge md:badge-lg badge-info" v-if="selectedName">Selected: {{ selectedName }}</div>
          </div>
        </BeneluxMap>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>