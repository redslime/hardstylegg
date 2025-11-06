<script setup lang="ts">
import confetti from "canvas-confetti";
import MicroChevronDoubleRightIcon from "~/components/icons/MicroChevronDoubleRightIcon.vue";
import HeartIcon from "~/components/icons/HeartIcon.vue";
import Countdown from "~/components/Countdown.vue";
import {bitsToHex, copyToClipboard, debug} from "~/utils/utils";
import ResultShareButton from "~/components/ResultShareButton.vue";
import {
  gameComps,
  getCookieMemory,
  getPreviewTitle, getReportCode, hasPlayedToday,
  reportResult,
  sendReport,
  startGame,
  updateState
} from "~/utils/game";
import {
  type CookieDayMemory,
  type CookieStreakMemory,
  type GameContainer,
  type GameData,
  GameState
} from "~/types/models";
import {getTracks} from "~/utils/tracks";
import {useLocalStorage} from "@vueuse/core";

useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
  ]
})

const props = defineProps({
  gameData: { type: Object as PropType<GameContainer>, required: true },
  cookie: { type: Object as PropType<CookieDayMemory[]>, required: true }
})
const streak = useLocalStorage<CookieStreakMemory>("streak", { streak: 0, lastDayId: -1 })
const dayId = ref<number>(props.gameData.dayId)
const gameData = reactive<GameData[]>(props.gameData.data)
const currentIndex = ref(0)
const currentGameData = computed<GameData>(() => gameData[currentIndex.value]!!)
const currentGameComp = computed(() => gameComps[currentGameData.value.name as keyof typeof gameComps])
const currentState = computed<GameState>(() => currentGameData.value.props.state)
const summary = ref<boolean>(false)
const details = ref<boolean>(false)
const mounted = ref<boolean>(false)
const gamesWon = computed<number>(() => gameData.filter(g => g.props.state == GameState.SUCCEEDED).length)
const teleportTo = computed(() => {
  if(!details.value) {
    return "#state-playing"
  } else {
    return "#state-summary"
  }
})
const shareCode = computed<string>(() => {
  const bits: string = gameData.map(gd => gd.props.state === GameState.SUCCEEDED ? "1" : "0").join("")
  return dayId.value + ";" + bitsToHex(bits).hex
})
const played = computed(() => hasPlayedToday(props.cookie, dayId.value))

const currentTypeId = computed<number>(() => currentGameComp.value.id)
const currentGameId = computed<number>(() => currentGameData.value.props.container.id)

provide("details", details)
provide("summary", summary)
provide("currentIndex", currentIndex)

const listener = (state: GameState) => {
  if(state === GameState.SUCCEEDED) {
    confetti()
    reportResult(rep => {
      rep.success = true
    })
  } else if(state === GameState.FAILED) {
    reportResult(rep => {
      rep.success = false
    })
  }

  currentGameData.value.props.state = state
}

function skip() {
  currentGameData.value.props.state = GameState.FAILED

  reportResult(report => {
    report.success = false
  })
}

function advanceStreak() {
  const today = dayId.value

  if(streak.value.lastDayId === today - 1) {
    streak.value.streak++
    streak.value.lastDayId = today
  } else if(streak.value.lastDayId < today - 1) {
    streak.value.streak = 0
    streak.value.lastDayId = today
  }
}

function next() {
  if(currentIndex.value+1 >= gameData.length) {
    summary.value = true
    currentIndex.value = 0

    updateState(null, null)
    sendReport()
    advanceStreak()

    const data = getCookieMemory()

    if(data) {
      if(props.cookie.length >= 14) {
        debug("removing oldest cookie memory data")
        props.cookie.shift()
      }

      debug("pushing data into cookie: ", data)
      props.cookie.push(data)
    }
  } else {
    currentIndex.value++
    currentGameData.value.props.state = GameState.PLAYING
    updateState(currentTypeId.value, currentGameId.value)
  }
}

const copyResult = () => {
  const reportCode = getReportCode()
  let url = `https://hardstyle.gg/share?r=${shareCode.value}`

  if(reportCode) {
    url = `https://hardstyle.gg/share?c=${reportCode}`
  }

  copyToClipboard(`I scored ${gamesWon.value}/${gameData.length} on hardstyle.gg today. Join me!\n${url}`)
}

useOnce(() => {
  startGame()
  getTracks().then(() => {}) // preload tracks
})

onMounted(() => {
  if(played.value) {
    navigateTo("/")
  } else {
    mounted.value = true
    updateState(currentTypeId.value, currentGameId.value)
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 p-1.5 w-full items-center justify-center bg-base-100 fixed right-0 bottom-0 left-0 z-1 md:hidden" v-if="!summary">
    <div class="w-full sm:w-7/8" id="top-dock">

    </div>
    <div class="w-full flex flex-row justify-around content-baseline gap-4">
      <div class="[&:empty]:hidden" id="spotify-dock">

      </div>
      <button class="flex flex-row content-baseline btn btn-lg btn-accent" @click="next" v-if="currentState !== GameState.PLAYING">
        Next
        <MicroChevronDoubleRightIcon />
      </button>
      <button class="flex flex-row content-baseline btn btn-soft btn-lg btn-secondary" @click="skip" v-if="currentState === GameState.PLAYING">
        Skip
        <MicroChevronDoubleRightIcon />
      </button>
      <div class="[&:empty]:hidden" id="side-dock">

      </div>
    </div>
  </div>

  <div class="relative w-full">
    <div class="flex justify-center flex-wrap gap-2 mb-8" v-if="!details">
      <div v-for="game in gameData" :key="game.name"
           class="p-3 rounded-md tooltip"
           :data-tip="getPreviewTitle(game)"
           :class="{
          'bg-base-100': game.props.state === GameState.UPCOMING,
          'bg-primary text-primary-content': game.props.state === GameState.PLAYING,
          'bg-success': game.props.state === GameState.SUCCEEDED,
          'bg-error': game.props.state === GameState.FAILED,
        }">
        <component :is="gameComps[game.name as keyof typeof gameComps].icon" :state="game.props.state" />
      </div>
    </div>

    <div class="invisible md:visible absolute inset-y-0 right-4 top-14 md:top-0" v-if="currentState == GameState.PLAYING">
      <div class="flex place-items-center gap-1 p-3 rounded-md bg-base-100 align-self-end text-secondary
        cursor-pointer hover:bg-secondary hover:text-secondary-content transition-colors"
           @click="skip">
        Skip
        <MicroChevronDoubleRightIcon />
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center w-full" id="state-playing">

  </div>

  <div class="bg-base-100 w-full md:w-2/3 p-5 rounded-md text-center" v-if="summary">
    <div class="flex items-center justify-center gap-2 mb-8">
      <HeartIcon class="text-primary" />
      <div class="text-3xl md:text-4xl font-bold">Thanks for playing!</div>
    </div>

    <div class="flex flex-col w-full items-center">
      <CookieStreakBanner class="w-fit" :streak="streak.streak" />
    </div>

    <div>
      You scored <b>{{ gamesWon }} / {{ gameData.length }}</b> today!
    </div>
    <div>
      Next daily challenge in <Countdown />
    </div>
    <div class="flex flex-wrap justify-center mt-8 gap-2">
      <ResultShareButton :action="copyResult" />
      <button class="btn btn-soft btn-secondary" @click="details=!details">
        {{ details ? "Hide" : "Show" }} detailed summary
      </button>
    </div>
  </div>

  <div class="flex flex-col w-full md:w-2/3 my-5 pb-5 border-secondary/50 border-1 rounded-md" v-if="summary && details">
    <div class="flex justify-center bg-base-300 flex-wrap gap-2 border-b-1 py-4 mb-4 border-secondary/50">
      <div v-for="(game, index) in gameData" :key="game.name"
           class="p-3 rounded-md cursor-pointer tooltip"
           :data-tip="getPreviewTitle(game)"
           :class="{
              'outline-2 outline-primary': currentIndex === index,
              'bg-base-100': game.props.state === GameState.UPCOMING,
              'bg-primary text-primary-content': game.props.state === GameState.PLAYING,
              'bg-success': game.props.state === GameState.SUCCEEDED,
              'bg-error': game.props.state === GameState.FAILED,
            }"
           @click="currentIndex=index"
      >
        <component :is="gameComps[game.name as keyof typeof gameComps].icon" :state="game.props.state" />
      </div>
    </div>

    <div class="px-5" id="state-summary">

    </div>
  </div>

  <div class="invisible md:visible mt-8 text-center" v-if="!summary && (currentState == GameState.FAILED || currentState == GameState.SUCCEEDED)">
    <button class="btn btn-lg bg-accent text-accent-content" @click="next">
      Next
      <MicroChevronDoubleRightIcon />
    </button>
  </div>

  <Teleport :to="teleportTo" v-if="mounted">
    <KeepAlive>
      <component v-if="!summary || (summary && details)" :is="currentGameComp.comp" :key="currentIndex" v-bind="currentGameData.props" @onFinish="listener" />
    </KeepAlive>
  </Teleport>

</template>

<style scoped>
.dock {
  flex-direction: column;
}
</style>