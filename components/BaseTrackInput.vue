<script setup lang="ts">
import {computed, ref} from 'vue'
import {getAlbums, getTracks} from "~/utils/contentCache";
import {containsSubstring} from "~/utils/utils";
import {useAsyncData} from "#app";
import {BaseTrack} from "~/types/content";
import {highlight, highlightExact, highlightKeywords} from "~/utils/fuse";
import {type SearchableResult, useSearchableList} from "~/composables/useSearchableList";
import {useSelectableSearchInput} from "~/composables/useSelectableSearchInput";

interface SearchResult extends SearchableResult<BaseTrack> {
  highlighted: string
}

const { xl, isAlbums, titleOnly, limit } = defineProps({
  xl: { type: Boolean, required: false },
  isAlbums: { type: Boolean, default: false },
  titleOnly: { type: Boolean, default: false },
  limit: { type: Number, default: 5 },
})

const isMobile = inject<boolean>("isMobile")
const fetchProgress = ref(0)
const mode = isAlbums ? "albums" : "tracks"

const { data: albumsData } = await useAsyncData<BaseTrack[]>(`${mode}-flat`, () => isAlbums ? getAlbums((p) => {
  fetchProgress.value = p
}) : getTracks((p) => {
  fetchProgress.value = p
}), {
  lazy: true
})

const allOptions = computed(() => albumsData.value || [])

const {
  query,
  debouncedQuery,
  results
} = useSearchableList(albumsData, {
  minQueryLength: 3,
  debounceMs: 300,
  maxFuseResults: 5,
  fuseKeys: titleOnly ? ["title"] : ["title", "artists"],
  getSearchText: (item) => item.getDisplayName(titleOnly)
})

const filtered = computed<SearchResult[]>(() => {
  return results.value
      .slice(0, limit)
      .map((result) => {
        const displayName = result.item.getDisplayName(titleOnly)

        if (result.score === 99) {
          return {
            ...result,
            item: result.item as BaseTrack,
            highlighted: highlightExact(displayName, containsSubstring(displayName, debouncedQuery.value))
          }
        }

        if (result.matches?.length) {
          const artistMatch = result.matches.filter((match) => match.key === "artists")
          const titleMatch = result.matches.filter((match) => match.key === "title")
          const artistHtml = highlight(result.item.getArtistsString(), artistMatch)
          const titleHtml = highlight(result.item.title, titleMatch)

          return {
            ...result,
            item: result.item as BaseTrack,
            highlighted: titleOnly ? `${titleHtml}` : `${artistHtml} - ${titleHtml}`
          }
        }

        return {
          ...result,
          item: result.item as BaseTrack,
          highlighted: highlightKeywords(displayName, debouncedQuery.value)
        }
      })
})

const emit = defineEmits<{
  onSelected: [
    track: BaseTrack,
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
  getItemLabel: (item) => item.getDisplayName(titleOnly),
  onSelect: (item, inputFeedback) => {
    emit('onSelected', item, inputFeedback)
  },
  defaultPlaceholder: isAlbums ? "Album..." : "Track...",
  fetchProgress,
  minQueryLength: 3,
  xl
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
            <span class="font-light">Loading {{ mode }} database...</span>
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
             @click="select(item.item as BaseTrack)"
             v-html="item.highlighted"
        >
        </div>
      </div>
    </Teleport>
  </div>
</template>
