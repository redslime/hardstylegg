<script setup lang="ts">
import {type Artist, type Festival, festivalOptions, type ZoomerType} from "~/types/zoomerModels";
import {capitalize, getYearsInbetween, getYearsUntilToday} from "~/utils/utils";
import ZoomOutIcon from "~/components/icons/ZoomOutIcon.vue";

const { target, game, step } = defineProps({
  target: { type: Object as PropType<ZoomerType>, required: false },
  game: { type: Boolean, required: false },
  step: { type: Number, required: false, default: 0 },
  finished: { type: Boolean, required: false },
})
const goal = ref<ZoomerType>()
const emit = defineEmits(['select'])
const isMobile = inject<boolean>('isMobile', false)
const festivalNames = computed<string[]>(() => festivalOptions.map(f => f.name))
const festivalInfo = computed<Festival | undefined>(() => {
  return festivalOptions.find(f => f.name === goal.value?.name)
})
const years = computed<number[]>(() => {
  const data = festivalInfo.value?.years

  if(data) {
    if(Array.isArray(data)) {
      if(data.length === 1) {
        return getYearsUntilToday(data[0]!!)
      } else if(data.length === 2) {
        return getYearsInbetween(data[0]!!, data[1]!!)
      } else {
        return data
      }
    } else {
      return [data]
    }
  }

  return []
})
const customFields = computed(() => {
  return festivalInfo.value?.options
})
const festivalReady = computed(() => {
  return goal.value && goal.value.id === "festival" && goal.value.name && goal.value.years
      && Object.entries(goal.value.fields!!).length === Object.entries(customFields.value ?? {}).length
})

function selectArtist() {
  goal.value = <Artist>{
    id: "artist",
    name: ""
  }
}

function selectFestival() {
  goal.value = <Festival> {
    id: "festival",
    fields: {}
  }
}

function finish() {
  emit("select", goal.value)

  if(goal.value?.id === 'artist' && game) {
    goal.value.name = ""
  }
}

// make sure all festival data is cleared properly when re-selecting
const goalName = computed(() => goal.value?.name)
watch(goalName, (newVal) => {
  if(newVal && goal.value && goal.value.id === 'festival') {
    selectFestival()
    goal.value.name = newVal
  }
})

onMounted(() => {
  if(target) {
    if(target.id === "festival") {
      selectFestival()
    } else if(target.id === "artist") {
      selectArtist()
    }
  }
})
</script>

<template>
  <div class="flex flex-col justify-center items-center min-w-sm"
    :class="{'bg-base-300 p-3 w-fit border-primary/50 border-1 rounded-md': !game }">
    <template v-if="!goal">
      <h3 class="text-lg font-bold mb-2 text-center">Select category</h3>
      <div class="flex gap-3">
        <button class="btn btn-primary btn-soft" @click="selectArtist()">Artist</button>
        <button class="btn btn-primary btn-soft" @click="selectFestival()">Festival</button>
      </div>
    </template>

    <template v-else>
      <template v-if="goal.id === 'artist'">
        <Teleport to="#top-dock" :disabled="!isMobile || !game">
          <fieldset class="fieldset flex gap-2 justify-center">
            <input type="text" class="input" v-model="goal.name" @keyup.enter="finish()" placeholder="Artist name..." />

            <button class="btn btn-warning btn-soft tooltip" v-if="game && step < 5" @click="finish()" data-tip="No idea what to guess? Zoom out!">
              <ZoomOutIcon />Next
            </button>
          </fieldset>
        </Teleport>

        <button class="btn btn-soft btn-success" v-if="!game" :disabled="goal.name.trim().length < 1" @click="finish()">Continue</button>

        <Teleport to="#side-dock" :disabled="!isMobile">
          <div class="text-center" :class="{'mt-5': !isMobile}" v-if="!finished">
            <button class="btn btn-outline btn-primary btn-lg" v-if="game" :disabled="goal.name.trim().length < 1" @click="finish()">Submit</button>
          </div>
        </Teleport>
      </template>

      <template v-if="goal.id === 'festival'">
        <h3 class="text-lg font-bold mb-2 text-center" v-if="!game">Select festival</h3>

        <Teleport to="#top-dock" :disabled="!isMobile || !game">
          <div class="flex gap-2 justify-center">
            <select class="select w-fit" v-model="goal.name">
              <option disabled :value="undefined">Pick an event</option>
              <option v-for="name in festivalNames" :key="name" :value="name">{{ name }}</option>
            </select>

            <select class="select w-fit" v-model="goal.years" v-if="goal.name && years">
              <option disabled :value="undefined">Year</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>

            <template v-if="customFields">
              <select v-if="goal.name && goal.years" class="select w-fit"
                      v-for="([key, vals], index) of Object.entries(customFields)" :key="index"
                      v-model="goal.fields!![key]">
                <option disabled :value="undefined">{{ capitalize(key) }}</option>
                <option v-for="val in vals" :key="val" :value="val">{{ val }}</option>
              </select>
            </template>

            <button class="btn btn-soft btn-success" v-if="!game" :disabled="!festivalReady" @click="finish()">Continue</button>
            <button class="btn btn-warning btn-soft tooltip" v-if="game && step < 5" @click="finish()" data-tip="No idea what to guess? Zoom out!">
              <ZoomOutIcon />Next
            </button>
          </div>
        </Teleport>

        <Teleport to="#side-dock" :disabled="!isMobile || !game">
          <div class="text-center" :class="{'mt-5': !isMobile}" v-if="!finished">
            <button class="btn btn-outline btn-primary btn-lg" v-if="game" :disabled="!festivalReady" @click="finish()">Submit</button>
          </div>
        </Teleport>
      </template>
    </template>
  </div>
</template>

<style scoped>

</style>