<script setup lang="ts">
import {GameState} from "~/types/models";
import type {PropType} from 'vue'
import {computed, reactive, watch} from 'vue'
import type {CompleteLyricsContainer} from "~/types/gameModels";
import {CompleteLyricsDef} from "~/utils/game/clientGameRegistry";

// Discriminated union for line parts to enable safe narrowing in the template
interface LinePartInput { isInput: true; name: string }
interface LinePartText { isInput: false; text: string }
type LinePart = LinePartInput | LinePartText

const emit = defineEmits(['onFinish'])
const props = defineProps({
  state: { type: Number as PropType<GameState>, required: true },
  position: { type: Number as PropType<number>, required: true },
  container: { type: Object as PropType<CompleteLyricsContainer>, required: true }
})

const state = computed(() => props.state)
const finished = computed(() => state.value == GameState.SUCCEEDED || state.value == GameState.FAILED)
const description = computed(() => props.container?.track?.artists + ' - ' + props.container?.track?.title)
const text = computed(() => props.container.text)
const currentIndex = inject<number>('currentIndex')

const lines = computed(() => {
  return text.value.split('\n').map(lineText => {
    const regex = /\[\[(.+?)\]\]/g
    const parts: LinePart[] = []
    let lastIndex = 0
    let match
    let index = 0

    while ((match = regex.exec(lineText)) !== null) {
      const [full, name] = match

      if (match.index > lastIndex) {
        parts.push({isInput: false, text: lineText.slice(lastIndex, match.index)})
      }

      const key = name!!.trim() || `input_${index}`

      if (!(key in answers)) {
        answers[key] = ''
      }

      parts.push({
        isInput: true,
        name: key
      })

      lastIndex = regex.lastIndex
      index++
    }

    if (lastIndex < lineText.length) {
      parts.push({isInput: false, text: lineText.slice(lastIndex)})
    }

    return {parts}
  })
})

const answers = reactive<Record<string, string>>({})
watch(answers, (newAnswers) => {
  const allCorrect = Object.entries(newAnswers)
      .every(([correct, given]) => (given || "").toLowerCase() === correct.toLowerCase())

  if(allCorrect) {
    emit("onFinish", GameState.SUCCEEDED)
  }
}, { deep: true })
</script>

<template>
  <GameTitle :gameDef="CompleteLyricsDef" :container="props.container" />

  <div class="flex flex-col items-center">
    <div class="text-xl text-center text-base-content/80 mb-4">{{ description }}</div>
    <div class="bg-base-300 p-3 text-center whitespace-pre-wrap rounded-lg">
      <div class="space-y-2">
        <template v-for="(line, lineIndex) in lines" :key="lineIndex">
          <p>
            <template v-for="(part, i) in line.parts" :key="i">
              <template v-if="!part.isInput">
                <span>{{ part.text }}</span>
              </template>

              <template v-else>
              <span v-if="finished || (answers[part.name]?.toLowerCase() === part.name.toLowerCase())" class="font-bold"
                    :class="{
                  'text-success/80': answers[part.name]?.toLowerCase() === part.name.toLowerCase(),
                  'text-error/80': answers[part.name]?.toLowerCase() !== part.name.toLowerCase()
                }">
                {{ part.name }}
              </span>
                <input
                    v-else
                    v-model="answers[part.name]"
                    class="input input-xs"
                    :style="{ width: `${Math.max(3, 4 + part.name.length)}ch` }"
                />
              </template>
            </template>

          </p>
        </template>
      </div>
    </div>

    <div class="mt-4" v-if="finished && currentIndex === props.position">
      <SpotifyButton :track="props.container?.track" />
    </div>
  </div>
</template>

<style scoped>

</style>