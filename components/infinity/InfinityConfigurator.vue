<script setup lang="ts">
import {getInfinityPreview, INFINITY_END_YEAR, INFINITY_START_YEAR} from "~/utils/infinity";
import {decodeSelection, YEAR_FILTER_GAMES} from "#shared/games";
import type {InfinityRequestContainer} from "~/types/models";

const MAX_SHARED: number = 100

const { data: infinityPreview } = await useAsyncData(() => getInfinityPreview(), { lazy: true })

const { $gameRegistry } = useNuxtApp();
const props = defineProps({
  shareCode: { type: String, required: false },
  typeEncoding: { type: String, required: false },
  years: { type: Object as PropType<{ start: number; end: number }>, required: false}
})

console.log(props.years)
const emit = defineEmits<{
  done: [container: InfinityRequestContainer | { code: string }]
}>()
const selected = ref<number[]>(
    props.typeEncoding
        ? decodeSelection(props.typeEncoding).map(g => g.id)
        : $gameRegistry.getGames().map(g => g.id)
)
const validSelection = computed<boolean>(() => {
  const nonEmpty = selected.value.length > 0

  if(!isSharing.value) {
    return nonEmpty
  } else {
    return selectedSharedSum.value <= MAX_SHARED && nonEmpty
  }
})
const selectionCount = computed<number>(() => {
  if(validSelection.value) {
    const count = selected.value.map(g => getYearFilteredGameCount(g, infinityPreview.value?.games[g] ?? 0)).reduce((a, b) => a + b, 0)

    if(isSharing.value) {
      return selectedSharedSum.value
    } else {
      return count
    }
  } else {
    return selectedSharedSum.value
  }
})
const totalCount = computed<number>(() => Object.values(infinityPreview.value?.games ?? [0]).reduce((a, b) => a + b, 0))
const isSharing = ref<boolean>(false)
const selectedShared = ref<Record<number, number>>({})
const selectedSharedSum = computed<number>(() => Object.values(selectedShared.value).reduce((a, b) => a + b, 0))
const startYear = ref<number>(props.years ? props.years.start : INFINITY_START_YEAR)
const endYear = ref<number>(props.years ? props.years.end : INFINITY_END_YEAR)
const shareCodeInput = ref<string>(props.shareCode ?? "")

function toggle(id: number) {
  if(selected.value.includes(id)) {
    selected.value.splice(selected.value.indexOf(id), 1)
  } else {
    selected.value.push(id)
  }

  if(isSharing.value) {
    if(id in selectedShared.value) {
      delete selectedShared.value[id]
    } else {
      fillGameCount(id)
    }
  }
}

function selectAll() {
  selected.value = $gameRegistry.getGames().map(g => g.id)
  $gameRegistry.getGames().forEach(g => {
    if(!(g.id in selectedShared.value)) {
      fillGameCount(g.id)
    }
  })
}

function fillGameCount(typeId: number) {
  const available = MAX_SHARED - selectedSharedSum.value
  selectedShared.value[typeId] = Math.min(getYearFilteredGameCount(typeId, infinityPreview.value?.games[typeId] ?? 0), Math.max(0, available))
}

function selectNone() {
  selected.value = []
  selectedShared.value = {}
}

function getYearFilteredGameCount(id: number, fallback?: number): number {
  let sum = 0

  if(infinityPreview.value?.trackYears) {
    if(id in infinityPreview.value?.trackYears) {
      const map: {year: number, count: number}[] = infinityPreview.value?.trackYears[id]!!

      for(let i = startYear.value; i <= endYear.value; i++) {
        sum += (map.find(e => e.year === i)?.count) ?? 0
      }
    } else {
      return fallback ?? -1
    }
  }

  return sum
}

function play() {
  const container = <InfinityRequestContainer>{
    typeIds: selected.value,
    shared: isSharing.value,
    startYear: startYear.value,
    endYear: endYear.value
  }

  if(isSharing.value) {
    container.typeLimits = selectedShared.value
  }

  emit('done', container)
}

function playShared() {
  if(shareCodeInput.value && shareCodeInput.value.length > 0) {
    emit('done', { code: shareCodeInput.value })
  }
}

function updateYears() {
  if(isSharing.value) {
    YEAR_FILTER_GAMES.filter(id => id in selectedShared.value).forEach(id => {
      selectedShared.value[id] = 0
      fillGameCount(id)
    })
  }
}

watch(isSharing, value => {
  if(value) {
    selected.value.forEach(id => {
      selectedShared.value[id] = getYearFilteredGameCount(id, infinityPreview.value?.games[id] ?? 0)
    })

    if(selectedSharedSum.value > MAX_SHARED) {
      // scale all values down so they fit within max_shared
      const factor = MAX_SHARED / selectedSharedSum.value

      Object.keys(selectedShared.value).forEach(id => {
        selectedShared.value[Number(id)] = Math.floor(selectedShared.value[Number(id)]!! * factor)
      })

      // adjust for rounding errors to reach exactly MAX_SHARED if possible
      let diff = MAX_SHARED - selectedSharedSum.value

      if (diff > 0) {
        const ids = Object.keys(selectedShared.value).map(Number)

        for (let i = 0; i < diff && i < ids.length; i++) {
          selectedShared.value[ids[i]!!]!!++
        }
      }
    }
  } else {
    selectedShared.value = {}
  }
})

watch(startYear, () => updateYears())
watch(endYear, () => updateYears())
</script>

<template>
  <div role="alert" class="alert alert-success alert-soft" v-if="props.typeEncoding || props.shareCode">
    <span v-if="props.shareCode">The share code was loaded from your share link</span>
    <span v-else-if="props.typeEncoding">The selected games were loaded from your share link</span>
  </div>

  <div class="flex gap-2" :class="{'flex-col': (!props.typeEncoding && !props.shareCode) || props.shareCode, 'flex-col-reverse': props.typeEncoding}">
    <div class="border rounded-md p-2 w-full relative flex flex-col gap-3"
         :class="{ 'border-white/20': !props.shareCode, 'border-success': props.shareCode }">
      <h2 class="text-xl font-semibold text-center">Enter share code:</h2>

      <div class="flex flex-wrap gap-2 justify-center items-center">
        <fieldset class="fieldset">
          <input type="text" class="input" placeholder="ABC123" maxlength="6" v-model="shareCodeInput" />
        </fieldset>

        <div>
          <button class="btn btn-success btn-lg" :disabled="shareCodeInput?.length != 6" @click="playShared">Play</button>
        </div>
      </div>
    </div>

    <div class="divider">OR</div>

    <div class="border rounded-md p-2 w-full relative flex flex-col gap-6"
         :class="{
          'border-white/20': validSelection && !props.typeEncoding,
          'border-success': validSelection && props.typeEncoding,
          'border-error': !validSelection
        }">
      <div class="absolute -top-3 sm:top-2 right-2 flex gap-2">
        <button class="btn btn-xs btn-neutral" @click="selectAll">select all</button>
        <button class="btn btn-xs btn-neutral" @click="selectNone">select none</button>
      </div>

      <h2 class="text-xl font-semibold text-center">Select games:</h2>

      <div class="flex flex-wrap gap-4 justify-center">
        <div class="rounded-md btn btn-primary indicator" v-for="game in $gameRegistry.getGames()"
             :class="{ '': selected.includes(game.id), 'btn-soft': !selected.includes(game.id) }"
             @click="toggle(game.id)">
          <div class="flex gap-1">
            <component :is="game.icon" :key="game.id" :game="game" />
            {{ game.getSpacedName() }}
          </div>
          <span class="indicator-item indicator-end badge badge-sm badge-soft px-1.5 transition-all duration-100" v-if="infinityPreview"
                :class="{ 'badge-primary': selected.includes(game.id) }">
          {{ infinityPreview.games[game.id] }}
        </span>
        </div>
      </div>

      <div class="text-center border-t border-white/20 pt-6 border-dashed"
           v-if="selected.find(id => YEAR_FILTER_GAMES.includes(id))">
        <h2 class="text-xl font-bold">Track year filter</h2>

        <p class="text-base-content/80">Tracks from <b>{{ startYear }}-{{ endYear }}</b> will be played in</p>
        <p class="flex flex-wrap gap-4 justify-center mt-1 text-base-content/90">
        <span class="flex gap-1 font-semibold border rounded-md p-0.5 border-base-content/50 indicator" v-for="game in selected.filter(id => YEAR_FILTER_GAMES.includes(id)).map(id => $gameRegistry.findGameById(id)!!)">
          <component :is="game.icon" :key="game.id" :game="game" />
          {{ game.getSpacedName() }}
        <span class="indicator-item indicator-end badge badge-sm badge-soft px-1.5 badge-primary" v-if="infinityPreview">
          {{ getYearFilteredGameCount(game.id) }}
        </span>
        </span>
        </p>

        <YearRangeSlider v-model:start.number="startYear" v-model:end.number="endYear" />
      </div>

      <div class="text-center border-t border-white/20 pt-6 border-dashed">
        <h2 class="text-xl font-bold">Challenge sharing</h2>
        <p class="text-base-content/80">You can challenge your friends to play the same set of questions if you stay <b :class="{'text-error': selectedSharedSum > MAX_SHARED}">below {{ MAX_SHARED }} questions.</b></p>

        <div class="flex justify-center mt-5">
          <div class="collapse bg-base-100 border-base-300 border"
               :class="{ 'collapse-close w-46': !isSharing, 'collapse-open w-fit': isSharing }">
            <div class="collapse-title font-semibold after:start-5 after:end-auto pe-4 flex gap-1">
              <label class="label text-base-content w-full flex justify-center">
                <input type="checkbox" class="checkbox checkbox-success" v-model="isSharing" />
                Share challenge
              </label>
            </div>
            <div class="collapse-content text-sm">
              <p class="mb-3 text-base-content/70 max-w-60">Below you can configure the amount of questions per category:</p>
              <div class="flex flex-col gap-2 items-end">
                <div class="join" v-for="game in selected.map(id => $gameRegistry.findGameById(id)!!)">
                  <div class="btn btn-neutral join-item flex gap-1">
                    <component :is="game.icon" :key="game.id" :game="game" />
                    {{ game.getSpacedName() }}
                  </div>
                  <div>
                    <label class="input join-item w-20">
                      <input type="number" v-model.number="selectedShared[game.id]" required min="1" :max="infinityPreview?.games[game.id]" />
                    </label>
                  </div>
                </div>

                <p>Total: {{ selectedSharedSum }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 justify-center items-center border-t border-white/20 pt-6 border-dashed">
        <div class="text-center bg-black/25 p-3 rounded-md">
          <template v-if="infinityPreview">
            <h2 class="text-4xl font-black" :class="{'text-error': !validSelection}">
              {{ selectionCount }}<span class="font-extralight text-base-content/50">/{{ totalCount }}</span>
            </h2>
            <p class="font-light">selected questions</p>
          </template>
          <template v-else>
            <span class="loading loading-infinity loading-xl"></span>
            <p>Loading questions...</p>
          </template>
        </div>

        <div>
          <button class="btn btn-success btn-lg" :disabled="!validSelection || !infinityPreview" @click="play">Play</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>