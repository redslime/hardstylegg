<script setup lang="ts">
import type {CompleteLyricsContainer} from "~/types/gameModels";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {getName} from "~/utils/tracks";
import {computed} from "vue";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import InfoIcon from "~/components/icons/InfoIcon.vue";
import CompleteLyricsPreview from "~/components/games/complete-lyrics/CompleteLyricsPreview.vue";
import {watchOnce} from "@vueuse/shared";

const { $gameRegistry } = useNuxtApp();
const gameDef = $gameRegistry.CompleteLyricsDef
const { data, pending, error } = await useAsyncData<CompleteLyricsContainer[]>(() => gameDef.getAllInstances(), { lazy: true })
const { data: existingIds } = await useAsyncData<string[]>(() => gameDef.getExistingTracks(), { lazy: true })
const instances = ref<CompleteLyricsContainer[] | undefined>()
const editing = ref<CompleteLyricsContainer | undefined>()
const input = ref<string | undefined>()
const forceInput = ref<boolean>(false)

interface LinePart { isInput: boolean; text: string }

const editingLines = computed(() => {
  const text = editing.value?.text // needed to trigger recalculation
  return getLines(editing.value!!)
})

watchOnce(data, () => instances.value = data.value)

function getLines(instance: CompleteLyricsContainer) {
  return instance.text.split('\n').map(lineText => {
    const regex = /\[\[(.+?)\]\]/g
    const parts: LinePart[] = []

    lineText.split(' ').forEach(word => {
      if (regex.test(word)) {
        parts.push({ isInput: true, text: word.replace(regex, '$1') })
      } else {
        parts.push({ isInput: false, text: word })
      }
    })

    return {parts}
  })
}

function toggle(word: string, lineIndex: number) {
  const text = editing.value!!.text
  const lines = text.split('\n')
  const line = lines[lineIndex]!!
  const words = line.split(' ')
  const wordIndexInLine = words.indexOf(word)

  // wrap the selected word in [[ ]] or unpack
  if (wordIndexInLine !== -1) {
    const wordToReplace = words[wordIndexInLine]!!
    words[wordIndexInLine] = wordToReplace.startsWith('[[') ? wordToReplace.slice(2, -2) : `[[${wordToReplace}]]`
  }

  lines[lineIndex] = words.join(' ')
  editing.value!!.text = lines.join('\n')
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
      v-model:instances="instances"
      v-model:editing="editing"
      :gameDef="gameDef"
      >
      <template #previewBody="{ instance, clicked }">
        <CompleteLyricsPreview :instance="instance" @click="clicked()" />
      </template>

      <template #editTitle v-if="editing">
        <div class="flex gap-2 items-center">
          <div class="text-2xl font-bold" v-if="editing.track">{{ getName(editing.track) }}</div>
          <TrackPicker @selected="t => (editing!!.track = t)" :title="editing!!.track ? 'Replace' : 'Select'" :existing="existingIds" />
        </div>
      </template>

      <template #editBody v-if="editing && editing.track">
        <template v-if="!editing.text || forceInput">
          <div class="flex flex-col gap-2">
            <textarea class="textarea w-full" rows="10" placeholder="Enter lyrics..." v-model="input"></textarea>
            <p class="opacity-80 flex gap-1"><InfoIcon class="text-info" /> Copy the full lyrics into this box. You can choose which words to leave out in the next step.</p>
            <button class="btn btn-soft btn-success mt-2 w-fit" :disabled="!input || input.trim().length === 0"
              @click="editing.text = input!!; forceInput = false">
              Next
            </button>
          </div>
        </template>

        <div class="whitespace-pre-wrap" v-else>
          <template v-for="(line, lineIndex) in editingLines" :key="lineIndex">
            <p class="flex items-center gap-1">
              <template v-for="(part, i) in line.parts" :key="i">
                <template v-if="!part.isInput">
                  <span class="hover:bg-white/10 rounded-md cursor-pointer" @click="toggle(part.text, lineIndex)">
                    {{ part.text }}
                  </span>
                </template>

                <template v-else>
                  <span class="badge badge-outline badge-info badge-sm cursor-pointer hover:badge-primary"
                        @click="toggle('[[' + part.text + ']]', lineIndex)">
                    {{ part.text }}
                  </span>
                </template>
              </template>
            </p>
          </template>

          <p class="mt-5 opacity-80 flex">
            <InfoIcon class="text-info" />
            Click on individual words to toggle them.
          </p>
          <button class="btn btn-soft btn-primary mt-5" @click="forceInput = true; input = editing.text">Edit lyrics</button>
        </div>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>

</style>