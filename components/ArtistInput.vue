<script setup lang="ts">
import type {FlatArtist} from "~/types/content";
import {computed, ref} from "vue";
import {useAsyncData} from "#app";
import {getArtists} from "~/utils/contentCache";
import {containsSubstring} from "~/utils/utils";
import {highlight, highlightExact, highlightKeywords} from "~/utils/fuse";
import {type SearchableResult, useSearchableList} from "~/composables/useSearchableList";
import {useSelectableSearchInput} from "~/composables/useSelectableSearchInput";

interface SearchResult extends SearchableResult<FlatArtist> {
  highlighted: string
}

const props = defineProps({
  xl: { type: Boolean, required: false },
  limit: { type: Number, default: 5 },
})
const isMobile = inject<boolean>("isMobile")
const fetchProgress = ref(0)
const { data: artistsData } = await useAsyncData<FlatArtist[]>('artists-flat', () => getArtists((p) => {
  fetchProgress.value = p
}), { lazy: true })
const allOptions = computed(() => artistsData.value || [])

const {
  query,
  debouncedQuery,
  results
} = useSearchableList(artistsData, {
  minQueryLength: 3,
  debounceMs: 300,
  maxFuseResults: 5,
  fuseKeys: ["name"],
  getSearchText: (artist) => artist.name
})

const filtered = computed<SearchResult[]>(() => {
  return results.value
      .slice(0, 5)
      .map((result) => {
        const name = result.item.getDisplayName()

        if (result.score === 0) {
          return {
            ...result,
            highlighted: highlightExact(name, containsSubstring(name, debouncedQuery.value))
          }
        }

        if (result.matches?.length) {
          return {
            ...result,
            highlighted: highlight(name, result.matches.filter((match) => match.key === "name"))
          }
        }

        return {
          ...result,
          highlighted: highlightKeywords(name, debouncedQuery.value)
        }
      })
})

const emit = defineEmits<{
  onSelected: [
    artist: FlatArtist,
    inputFeedback: (success: boolean) => boolean
  ]
}>()

const {
  hoverIndex,
  selected,
  errorFlash,
  successFlash,
  visible,
  inputBindings,
  inputEvents,
  select
} = useSelectableSearchInput({
  query,
  debouncedQuery,
  filtered,
  allOptions,
  getItemLabel: (artist) => artist.name,
  onSelect: (artist, inputFeedback) => {
    emit("onSelected", artist, inputFeedback)
  },
  defaultPlaceholder: "Artist...",
  fetchProgress,
  minQueryLength: 3,
  xl: computed(() => props.xl)
})
</script>

<template>
  <div class="relative">
    <Teleport to="#top-dock" :disabled="!isMobile">
      <div class="relative">
        <slot
            :inputBindings="inputBindings"
            :inputEvents="inputEvents"
            :errorFlash="errorFlash"
            :successFlash="successFlash"
        >
          <input
              v-bind="inputBindings"
              v-on="inputEvents"
          />
        </slot>

        <div class="flex absolute inset-0 justify-center items-center backdrop-blur-xs bg-black/70 rounded-md" v-if="fetchProgress != 100">
          <div class="flex flex-col w-1/2 text-center -mt-1">
            <span class="font-light">Loading artist database...</span>
            <progress class="progress progress-primary" v-if="fetchProgress == 0"></progress>
            <progress class="progress progress-primary" :value="fetchProgress" max="100" v-else></progress>
          </div>
        </div>
      </div>

      <div class="absolute z-10 w-full bg-base-100 border mt-1 rounded-lg shadow overflow-hidden
          py-2 divide-dashed divide-y divide-neutral" v-if="visible && !selected"
           :class="[
              isMobile ? 'bottom-full mb-1' : 'top-full mt-1'
            ]">
        <div v-for="(item, index) in filtered" :key="index"
             class="px-3 hover:bg-base-300 cursor-pointer font-xs md:font-3xl"
             :class="{'bg-base-300': hoverIndex === index}"
             @click="select(item.item as FlatArtist)"
             v-html="item.highlighted"
        >
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>

</style>