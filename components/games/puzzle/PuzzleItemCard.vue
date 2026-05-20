<script setup lang="ts">
import {RichArtist, type RichTrack} from "~/types/content";
import {countAttempt} from "~/utils/game";
import type {PuzzleItem} from "~/utils/game/impl/ClientPuzzleGame";

const draggingTitle = defineModel<boolean>('draggingTitle', { required: true });
const draggingArtist = defineModel<boolean>('draggingArtist', { required: true });
const elementMoving = defineModel<PuzzleItem | null>('elementMoving', { required: true });

const props = defineProps({
  tracks: { type: Array as PropType<RichTrack[]>, required: true },
  findItem: { type: Function as PropType<(itemId: number) => PuzzleItem | null>, required: true },
  startMovingItem: { type: Function as PropType<(item: PuzzleItem | null) => void>, required: true },
  movedItemId: { type: Number as PropType<number | null>, required: false, default: null }
})

const emit = defineEmits<{
  placed: [itemId: number]
  formed: [track: RichTrack]
}>()

const titleSlot = ref<PuzzleItem | null>(null)
const artistSlot = ref<PuzzleItem[]>([])
const formedTrack = ref<RichTrack | null>(null)
const isDragOver = ref(false)
const lastAcceptedItemId = ref<number | null>(null)

const formed = computed(() => formedTrack.value !== null)
const cardFailed = ref<boolean>(false)

const failCard = (track: RichTrack) => {
  formedTrack.value = track
  cardFailed.value = true
}
const isFormed = () => formedTrack.value !== null
defineExpose({ failCard, isFormed })

watch(
  () => props.movedItemId,
  itemId => {
    if (itemId === null) {
      return
    }

    if (lastAcceptedItemId.value === itemId) {
      lastAcceptedItemId.value = null
      return
    }

    if (titleSlot.value?.id === itemId) {
      titleSlot.value = null
      formedTrack.value = null
    }

    artistSlot.value = artistSlot.value.filter(item => item.id !== itemId)

    if(!formed.value) {
      checkFormed()
    }
  }
)

function getDraggedItemId(event: DragEvent) {
  const itemId = Number(event.dataTransfer!!.getData('text'))

  if (!Number.isFinite(itemId)) {
    return null
  }

  return itemId
}

function getDraggedItem(event: DragEvent) {
  const itemId = getDraggedItemId(event)

  if (itemId === null) {
    return null
  }

  return props.findItem(itemId)
}

function canAcceptItem(item?: PuzzleItem) {
  if (formed.value) {
    return false
  }

  if(item) {
    if (item.type === 'title') {
      return titleSlot.value === null || titleSlot.value.id === item.id
    }

    if (item.type === 'artist') {
      return !artistSlot.value.some(existing => existing.id === item.id)
    }
  }

  return true
}

function onDragOver(event: DragEvent) {
  if (!canAcceptItem()) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'none'
    }

    return
  }

  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  isDragOver.value = true
}

function onDragLeave(event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null

  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }

  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()

  const item = getDraggedItem(event)
  tryPlaceItem(item)
}

function tryPlaceItem(item: PuzzleItem | null) {
  isDragOver.value = false
  draggingTitle.value = false
  draggingArtist.value = false

  if (!item || !canAcceptItem(item)) {
    return
  }

  lastAcceptedItemId.value = item.id

  if (item.type === 'title') {
    titleSlot.value = item
  }

  if (item.type === 'artist') {
    artistSlot.value.push(item)
  }

  countAttempt()
  emit('placed', item.id)
  checkFormed()
}

function checkFormed() {
  if (!titleSlot.value) {
    return
  }

  const matchedTrack = props.tracks.find(track => {
    if (track.getDisplayName(true) !== titleSlot.value?.val) {
      return false
    }

    const droppedArtistSids = artistSlot.value
      .map(item => item.val)
      .filter((val): val is RichArtist => val instanceof RichArtist)
      .map(artist => artist.id)
      .sort()

    const trackArtistSids = track.artists
      .map(artist => artist.id)
      .sort()

    if (droppedArtistSids.length !== trackArtistSids.length) {
      return false
    }

    return droppedArtistSids.every((sid, index) => sid === trackArtistSids[index])
  })

  if (matchedTrack) {
    formedTrack.value = matchedTrack
    emit('formed', matchedTrack)
  }
}

function startDraggingPlacedItem(event: DragEvent, item: PuzzleItem) {
  if (formed.value) {
    event.preventDefault()
    return
  }

  draggingTitle.value = item.type === 'title'
  draggingArtist.value = item.type === 'artist'

  event.dataTransfer!!.dropEffect = 'move'
  event.dataTransfer!!.effectAllowed = 'move'
  event.dataTransfer!!.setData('text', `${item.id}`)
}

function tryStartMove(item: PuzzleItem | null) {
  if(!formed.value) {
    props.startMovingItem(item)
  }
}
</script>

<template>
  <div
    class="bg-base-100 border p-2 md:p-4 rounded-md transition-colors"
    :class="{
      'border-success bg-success/5': formed && !cardFailed,
      'border-error bg-error/5': formed && cardFailed,
      'border-primary bg-primary/10': isDragOver && !formed,
      'border-white/5': !isDragOver && !formed
    }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="tryPlaceItem(elementMoving)"
  >
    <div class="flex gap-4 items-center">
      <div>
        <div class="rounded-lg transition w-18 h-18 md:w-24 md:h-24 bg-black/30 border border-base-content/10">
          <img v-if="formedTrack" :src="formedTrack.getImageUrl()" class="w-full h-full object-cover rounded-lg" :alt="formedTrack.getDisplayName()"/>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="min-h-7 transition-colors"
          :class="{
            'bg-black/30 border border-warning/50 border-dashed rounded-md': !titleSlot && !draggingTitle && !cardFailed,
            'border border-primary border-dashed rounded-md': !titleSlot && draggingTitle && !formed,
            'w-40 md:w-60': !titleSlot && !formed
          }">
          <div v-if="titleSlot && !formed && !cardFailed" :draggable="!formed" class="badge badge-soft badge-warning font-semibold"
            :class="{
              'cursor-grab active:cursor-grabbing': !formed,
              'cursor-default': formed,
              'badge-outline': titleSlot.id === elementMoving?.id
            }"
            @dragstart="startDraggingPlacedItem($event, titleSlot)"
            @dragend="draggingTitle = false"
            @click.stop="tryStartMove(titleSlot)">
            {{ titleSlot.val }}
          </div>
          <div class="text-lg md:text-xl font-bold text-balance" v-else-if="titleSlot && formed && !cardFailed">
            {{ titleSlot.val }}
          </div>
          <div class="text-lg md:text-xl font-bold text-balance" v-else-if="cardFailed && formedTrack">
            {{ formedTrack.getDisplayName(true) }}
          </div>
        </div>

        <div class="min-h-5 transition-colors"
          :class="{
            'bg-black/30 border border-secondary/50 border-dashed rounded-md': artistSlot.length === 0 && !draggingArtist && !cardFailed,
            'w-30 md:w-40': artistSlot.length === 0 && !cardFailed,
            'w-fit': artistSlot.length > 0,
            'border border-primary border-dashed rounded-md': artistSlot.length === 0 && draggingArtist && !formed
          }">
          <div class="flex flex-wrap gap-1">
            <div v-for="artistItem in artistSlot" :key="artistItem.id" :draggable="!formed" class="font-semibold pl-0 badge badge-soft"
              :class="{
                'cursor-grab active:cursor-grabbing badge-secondary': !formed,
                'cursor-default': formed,
                'badge-outline': artistItem.id === elementMoving?.id
              }"
              @dragstart="startDraggingPlacedItem($event, artistItem)"
              @dragend="draggingArtist = false"
              v-if="!cardFailed"
              @click.stop="tryStartMove(artistItem)"
            >
              <div class="flex gap-1 items-center" v-if="artistItem.val instanceof RichArtist">
                <img :src="artistItem.val.getImageUrl()" class="rounded-full w-4 md:w-8 h-4 md:h-8 overflow-hidden object-cover" :alt="artistItem.val.getDisplayName()"/>
                <p>{{ artistItem.val.name }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-1">
              <div class="font-semibold pl-0 badge badge-soft" v-for="artist in formedTrack.artists" v-if="cardFailed && formedTrack" :key="artist.id">
                <div class="flex gap-1 items-center">
                  <img :src="artist.getImageUrl()" class="rounded-full w-4 md:w-8 h-4 md:h-8 overflow-hidden object-cover" :alt="artist.getDisplayName()"/>
                  <p>{{ artist.name }}</p>
                </div>
              </div>
            </div>

            <div class="bg-black/30 border border-primary border-dashed rounded-full px-1.5 font-bold transition-all"
              :class="{'opacity-0': !(artistSlot.length > 0 && draggingArtist && !formed), 'opacity-100': artistSlot.length > 0 && draggingArtist && !formed}">
              <p class="-mt-0.5">+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>