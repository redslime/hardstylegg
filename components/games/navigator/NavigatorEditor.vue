<script setup lang="ts">
import type {NavigatorContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import NavigatorPreview from "~/components/games/navigator/NavigatorPreview.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import ArrowRightIcon from "~/components/icons/ArrowRightIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import {watchOnce} from "@vueuse/shared";
import CpuChipIcon from "~/components/icons/CpuChipIcon.vue";
import {RichArtist} from "~/types/content";
import type {NavigatorPath} from "~/types/models";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.NavigatorDef
const { data, pending, error } = await useAsyncData<NavigatorContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const instances = ref<NavigatorContainer[] | undefined>()
const editing = ref<NavigatorContainer | undefined>()

const paths = ref<NavigatorPath[]>([])
const loadingPaths = ref<boolean>(true)
const steps = computed<number>(() => editing.value?.steps ?? 2)
const from = computed<RichArtist | undefined>(() => editing.value?.from)
const to = computed<RichArtist | undefined>(() => editing.value?.to)
const openStepModal = ref<boolean>(false)

function reset() {
  paths.value = []
}

async function calculatePaths() {
  paths.value = []
  loadingPaths.value = true

  if(editing.value && from.value && to.value) {
    paths.value = await $fetch<NavigatorPath[]>(`/api/content/path/${from.value.id}/${to.value.id}?maxSteps=${steps.value}`)
    loadingPaths.value = false

    if(paths.value.length === 0) {
      openStepModal.value = true
    }
  } else {
    loadingPaths.value = false
  }
}

function remapArtists(artists: RichArtist[]): RichArtist[] {
  return artists.map(RichArtist.fromJson)
}

watchOnce(data, () => instances.value = data.value)
watch(editing, async (val) => {
  if(val) {
    if(!val.steps) {
      val.steps = 2
    }

    await calculatePaths()
  }
})
watch(steps, () => calculatePaths())
watch(to, () => calculatePaths())
watch(from, () => calculatePaths())
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :gameDef="gameDef"
        @cancelled="reset()"
        @saved="reset()"
    >
      <template #previewBody="{ instance, clicked }">
        <NavigatorPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <input type="text" :value="gameDef.getIconPreviewTitle(editing!!)" class="input input-lg w-[80ch]" readonly />
      </template>

      <template #editBody v-if="editing">
        <div class="flex gap-5 mb-3 justify-around w-fit">
          <div class="p-4 text-center">
            <h2 class="mb-4 font-bold">From:</h2>
            <ArtistCard :artist="from" :clickable="false" class="mb-2" />
            <ArtistPicker :title="from ? 'Replace' : 'Select'" @selected="a => editing!!.from = a" />
          </div>

          <div class="content-center">
            <ArrowRightIcon class="size-10" />
          </div>

          <div class="p-4 text-center">
            <h2 class="mb-4 font-bold">To:</h2>
            <ArtistCard :artist="to" :clickable="false" class="mb-2" />
            <ArtistPicker :title="to ? 'Replace' : 'Select'" @selected="a => editing!!.to = a" />
          </div>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Max steps</legend>
          <input class="input" type="number" min="2" max="5" placeholder="Max steps" required v-model="editing.steps" />
        </fieldset>

        <div class="collapse collapse-arrow bg-base-100 border-base-300 border w-5/7 my-5" v-if="from && to">
          <input type="checkbox" v-model="openStepModal" />
          <div class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12 flex gap-1">
            <CpuChipIcon :class="{'text-info': paths.length > 0, 'text-gray-500': paths.length === 0}" />
            Possible paths
            <span v-if="!loadingPaths">({{ paths.length }})</span>
            <span v-else class="loading loading-spinner loading-sm ml-2"></span>
          </div>
          <div class="collapse-content text-sm">
            <div class="alert alert-error alert-soft" v-if="!loadingPaths && paths.length === 0">
              There are no possible paths!
            </div>

            <div class="flex flex-col gap-1" v-else>
              <div class="flex gap-1 items-center" v-for="(path, index) in paths" :key="index">
                <template v-for="(artist, ind) in remapArtists(path.nodes)" :key="artist.id">
                  <div class="tooltip" :data-tip="artist.getDisplayName()">
                    <img :src="artist.getImageUrl()" class="rounded-full w-10 h-10 overflow-hidden object-cover"
                         :alt="artist.getDisplayName()" />
                  </div>
                  <ArrowRightIcon class="size-5" v-if="ind+1 < path.nodes.length" />
                </template>
              </div>
            </div>
          </div>
        </div>

        <ContextField v-model:input="editing.context" />
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>