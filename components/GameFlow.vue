<script setup lang="ts">
import confetti from "canvas-confetti";
import MicroChevronDoubleRightIcon from "~/components/icons/MicroChevronDoubleRightIcon.vue";
import HeartIcon from "~/components/icons/HeartIcon.vue";
import Countdown from "~/components/Countdown.vue";
import {bitsToHex, copyToClipboard, debug} from "~/utils/utils";
import ResultShareButton from "~/components/ResultShareButton.vue";
import {
  getCookieMemory,
  getReportCode,
  hasPlayedToday,
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
  GameEnvironment,
  GameState
} from "~/types/models";
import {getTracks} from "~/utils/tracks";
import {useLocalStorage} from "@vueuse/core";
import QuestionMarkCircleIcon from "~/components/icons/QuestionMarkCircleIcon.vue";
import type {ClientGameDef} from "~/utils/game/ClientGameDef";
import ContextBox from "~/components/ContextBox.vue";

const { $gameRegistry } = useNuxtApp();
const props = defineProps({
  gameEnv: { type: Number as PropType<GameEnvironment>, required: true },
  gameData: { type: Object as PropType<GameContainer>, required: true },
  cookie: { type: Object as PropType<CookieDayMemory[]> }
})
const isApp = inject<boolean>("isApp", false) as unknown as Ref<boolean>
const streak = useLocalStorage<CookieStreakMemory>("streak", { streak: 0, lastDayId: -1 })
const emit = defineEmits(['finish'])
const dayId = ref<number>(props.gameData.dayId)
const gameData = reactive<GameData[]>(props.gameData.data)
const currentIndex = ref(0)
const currentGameData = computed<GameData>(() => gameData[currentIndex.value]!!)
const currentGameComp = computed<ClientGameDef<any>>(() => $gameRegistry.findGameByName(currentGameData.value.name)!!)
const currentState = computed<GameState>(() => currentGameData.value.props.state)
const summary = ref<boolean>(false)
const details = ref<boolean>(false)
const mounted = ref<boolean>(false)
const helpModal = ref<HTMLDialogElement | undefined>()
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
const tracked = computed<boolean>(() => props.gameEnv === GameEnvironment.DAILY)

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
    streak.value.streak = 1
    streak.value.lastDayId = today
  }
}

function next() {
  if(currentIndex.value+1 >= gameData.length) {
    summary.value = true
    currentIndex.value = 0

    updateState(null, null)
    sendReport()

    if(props.cookie) {
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
    }
  } else {
    currentIndex.value++
    currentGameData.value.props.state = GameState.PLAYING
    updateState(currentTypeId.value, currentGameId.value)
  }
}

const copyResult = () => {
  if(tracked.value) {
    const reportCode = getReportCode()
    let url = `https://hardstyle.gg/share?r=${shareCode.value}`

    if(reportCode) {
      url = `https://hardstyle.gg/share?c=${reportCode}`
    }

    copyToClipboard(`I scored ${gamesWon.value}/${gameData.length} on hardstyle.gg today. Join me!\n${url}`)
  }
}

useOnce(() => {
  startGame(props.gameEnv, isApp.value)
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
  <GamePreloader :gameData="gameData" />

  <div class="flex flex-col gap-2 p-1.5 w-full items-center justify-center bg-base-100 fixed right-0 bottom-0 left-0 z-500 md:hidden" v-if="!summary">
    <div class="w-full sm:w-7/8" id="top-dock">

    </div>
    <div class="relative w-full flex flex-row justify-around content-baseline gap-4">
      <div class="absolute inline-flex inset-y-0 left-4 items-center text-white/50 hover:text-white/70 cursor-pointer"
           v-if="currentState === GameState.PLAYING" @click="helpModal?.showModal()">
        <QuestionMarkCircleIcon />
      </div>
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
      <GameIconRow :games="gameData" />
    </div>

    <div class="invisible mt-2 md:visible absolute inset-y-0 left-4 top-14 md:top-0" v-if="currentState == GameState.PLAYING">
      <div class="p-1 text-white/50 hover:text-white/70 cursor-pointer" @click="helpModal?.showModal()">
        <QuestionMarkCircleIcon />
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

    <template v-if="tracked">
      <div class="flex flex-col w-full items-center">
        <CookieStreakBanner class="w-fit" :streak="streak.streak" />
      </div>

      <div class="flex flex-col w-full items-center">
        <div role="alert" class="alert alert-success alert-soft gap-2 mb-5" v-if="streak.streak <= 1">
          <p class="font-semibold">Missed yesterday's challenge? You can now play it in the <NuxtLink to="/archive" class="text-primary">archive</NuxtLink>!</p>
        </div>
      </div>

      <div>
        You scored <b>{{ gamesWon }} / {{ gameData.length }}</b> today!
      </div>
      <div>
        Next daily challenge in <Countdown />
      </div>
      <div class="text-sm mt-2 text-base-content/70">
        Today's editors: {{ props.gameData.editors }}
      </div>
      <div class="flex flex-wrap justify-center mt-8 gap-2">
        <ResultShareButton :action="copyResult" />
        <button class="btn btn-soft btn-secondary" @click="details=!details">
          {{ details ? "Hide" : "Show" }} detailed summary
        </button>
      </div>
    </template>

    <template v-else>
      <div>
        You scored <b>{{ gamesWon }} / {{ gameData.length }}</b>!
      </div>
      <div class="text-sm mt-2 text-base-content/70">
        Editors: {{ props.gameData.editors }}
      </div>
      <div class="flex flex-wrap justify-center mt-8 gap-2">
        <button class="btn btn-primary" @click="emit('finish')">Back to archive</button>
        <button class="btn btn-soft btn-secondary" @click="details=!details">
          {{ details ? "Hide" : "Show" }} detailed summary
        </button>
      </div>
    </template>
  </div>

  <PwaNotificationManager class="w-full md:w-fit" v-if="summary && tracked" />

  <div class="flex flex-col w-full md:w-2/3 my-5 pb-5 border-secondary/50 border-1 rounded-md" v-if="summary && details">
    <div class="flex justify-center bg-base-300 flex-wrap gap-2 border-b-1 py-4 mb-4 border-secondary/50">
      <GameIconRow :games="gameData" :outlineIndex="currentIndex" :click="index => currentIndex = index" />
    </div>

    <div class="px-5 flex flex-col items-center" id="state-summary">

    </div>
  </div>

  <div class="invisible md:visible mt-8 text-center" v-if="!summary && (currentState == GameState.FAILED || currentState == GameState.SUCCEEDED)">
    <button class="btn btn-lg bg-accent text-accent-content" @click="next">
      Next
      <MicroChevronDoubleRightIcon />
    </button>
  </div>

  <dialog ref="helpModal" id="helpModal" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Game help: {{ currentGameComp.getSpacedName() }}</h3>
      <p class="py-4 whitespace-pre-wrap">{{ currentGameComp.getHelpText(currentGameData.props.container) }}</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>

  <Teleport :to="teleportTo" v-if="mounted">
    <KeepAlive>
      <component v-if="!summary || (summary && details)" :is="currentGameComp.gameComponent" :key="currentIndex" v-bind="currentGameData.props" @onFinish="listener" />
    </KeepAlive>
    <ContextBox :container="currentGameData.props.container"
                v-if="(!summary || (summary && details)) && (currentState == GameState.FAILED || currentState == GameState.SUCCEEDED)" />
  </Teleport>

</template>

<style scoped>
.dock {
  flex-direction: column;
}
</style>