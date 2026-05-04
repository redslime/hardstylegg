<script setup lang="ts">
import {GameState} from "~/types/models";
import type {PuzzleContainer} from "~/types/gameModels";
import {RichArtist, RichTrack} from "~/types/content";
import PuzzleItemCard from "~/components/games/puzzle/PuzzleItemCard.vue";
import {countItem} from "~/utils/game";
import {nextTick} from "vue";
import type {PuzzleItem} from "~/utils/game/impl/ClientPuzzleGame";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.PuzzleDef
const isMobile = inject<boolean>('isMobile')
const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<PuzzleContainer>, required: true }
})
const finished = computed(() => props.state == GameState.SUCCEEDED || props.state == GameState.FAILED)

const cardsRef = useTemplateRef('cards')
const formedCards = ref<RichTrack[]>([])
const tracks = computed<RichTrack[]>(() => props.container.tracks)
const draggingTitle = ref<boolean>(false)
const draggingArtist = ref<boolean>(false)
const elementMoving = ref<PuzzleItem | null>(null)
const elements = ref<PuzzleItem[]>([])
const allItems = ref<PuzzleItem[]>([])
const movedItemId = ref<number | null>(null)

async function markItemMoved(itemId: number) {
  movedItemId.value = null
  elementMoving.value = null
  await nextTick()
  movedItemId.value = itemId
}

function findItem(itemId: number) {
  return allItems.value.find(item => item.id === itemId) ?? null
}

function removeFromPool(itemId: number) {
  elements.value = elements.value.filter(item => item.id !== itemId)
  markItemMoved(itemId)
}

function returnItemToPool(itemId: number) {
  const item = findItem(itemId)

  if (!item) {
    return
  }

  if (!elements.value.some(existing => existing.id === item.id)) {
    elements.value.push(item)
  }

  markItemMoved(item.id)
}

function onPoolDragOver(event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onPoolDrop(event: DragEvent) {
  event.preventDefault()

  const itemId = getDraggedItemId(event)

  draggingTitle.value = false
  draggingArtist.value = false

  if (itemId === null) {
    return
  }

  returnItemToPool(itemId)
}

function getDraggedItemId(event: DragEvent) {
  const itemId = Number(event.dataTransfer!!.getData('text'))

  if (!Number.isFinite(itemId)) {
    return null
  }

  return itemId
}

function startDraggingItem(event: DragEvent, item: PuzzleItem) {
  draggingTitle.value = item.type === 'title'
  draggingArtist.value = item.type === 'artist'

  event.dataTransfer!!.dropEffect = 'move'
  event.dataTransfer!!.effectAllowed = 'move'
  event.dataTransfer!!.setData('text', `${item.id}`)
}

function startMovingItem(item: PuzzleItem | null) {
  if(elementMoving.value?.id === item?.id) {
    elementMoving.value = null
    draggingTitle.value = false
    draggingArtist.value = false
  } else if(item) {
    elementMoving.value = item
    draggingTitle.value = item.type === 'title'
    draggingArtist.value = item.type === 'artist'
  }
}

function cardFormed(track: RichTrack, index: number) {
  formedCards.value.push(track)
  countItem(index, true)

  if(formedCards.value.length >= tracks.value.length) {
    emit("onFinish", GameState.SUCCEEDED)
  }
}

function tryReturnItem(event: Event) {
  if(elementMoving.value && !elements.value.map(i => i.id).includes(elementMoving.value.id)) {
    event.stopPropagation()
    returnItemToPool(elementMoving.value.id)
  }
}

onMounted(() => {
  gameDef.calculatePoolItems(props.container).forEach(i => {
    elements.value.push(i)
    allItems.value.push(i)
  })
})

watch(() => props.state, val => {
  if(val === GameState.FAILED) {
    const leftovers = tracks.value.filter(t => !formedCards.value.map(t => t.sid).includes(t.sid))

    if(cardsRef.value) {
      cardsRef.value.forEach(card => {
        if(card && !card.isFormed()) {
          card.failCard(leftovers.pop()!!)
        }
      })
    }
  }
})
</script>

<template>
  <div class="bg-base-200 border border-white/5 w-full p-5 min-h-16 mb-5 md:mb-10 rounded-lg indicator"
      @dragover="onPoolDragOver" @drop="onPoolDrop" v-if="!finished"
      @click="tryReturnItem($event)">
      <span class="indicator-item indicator-center badge badge-sm badge-secondary font-semibold">
        Puzzle pool
      </span>

    <div class="flex flex-row flex-wrap justify-center gap-4">
      <div v-for="element in elements" :key="element.id" draggable="true"
           class="badge badge-soft font-semibold cursor-grab active:cursor-grabbing"
          :class="{
          'pl-0 badge-secondary': element.type === 'artist',
          'badge-warning': element.type === 'title',
          'badge-lg': !isMobile,
          'badge-outline': elementMoving?.id === element.id
          }"
          @dragstart="startDraggingItem($event, element)"
          @dragend="draggingTitle = false; draggingArtist = false"
          @click="startMovingItem(element)">
        <div class="flex gap-1 items-center" v-if="element.val instanceof RichArtist">
          <img
              :src="element.val.getImageUrl()"
              class="rounded-full w-4 md:w-8 h-4 md:h-8 overflow-hidden object-cover"
              :alt="element.val.getDisplayName()"
          />
          <p>{{ element.val.name }}</p>
        </div>

        <p v-else>{{ element.val }}</p>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2 md:gap-3 w-full md:w-4/5">
    <PuzzleItemCard
        v-for="(track, index) in tracks"
        ref="cards"
        :key="track.sid"
        :tracks="tracks"
        :findItem="findItem"
        :movedItemId="movedItemId"
        :startMovingItem="startMovingItem"
        v-model:draggingTitle="draggingTitle"
        v-model:draggingArtist="draggingArtist"
        v-model:elementMoving="elementMoving"
        @placed="removeFromPool"
        @formed="t => cardFormed(t, index)"
    />
  </div>
</template>

<style scoped>

</style>