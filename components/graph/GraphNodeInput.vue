<script setup lang="ts">
import {type SearchableResult, useSearchableList} from "~/composables/useSearchableList";
import type {ArtistGraphNode} from "~/pages/graph.vue";
import {computed} from "vue";
import {highlight, highlightExact, highlightKeywords} from "~/utils/fuse";
import {containsSubstring} from "~/utils/utils";
import {useSelectableSearchInput} from "~/composables/useSelectableSearchInput";

interface SearchResult extends SearchableResult<ArtistGraphNode> {
  highlighted: string
}

const props = defineProps<{ nodes: ArtistGraphNode[] }>()
const nodes = computed(() => props.nodes)
const {
  query,
  debouncedQuery,
  results
} = useSearchableList<ArtistGraphNode>(nodes, {
  minQueryLength: 3,
  debounceMs: 300,
  maxFuseResults: 5,
  fuseKeys: ["name"],
  getSearchText: (node) => node.name
})
const filtered = computed<SearchResult[]>(() => {
  return results.value
      .slice(0, 5)
      .map((result) => {
        const name = result.item.name

        if (result.score === 99) {
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
    node: ArtistGraphNode,
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
} = useSelectableSearchInput<ArtistGraphNode>({
  query,
  debouncedQuery,
  filtered,
  allOptions: nodes,
  getItemLabel: (node) => node.name,
  onSelect: (node, inputFeedback) => {
    emit("onSelected", node, inputFeedback)
  },
  defaultPlaceholder: "Artist...",
  fetchProgress: 1,
  minQueryLength: 3
})
</script>

<template>
  <div class="relative">
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
      </div>

      <div class="absolute z-10 w-full bg-base-100 border mt-1 rounded-lg shadow overflow-hidden
          py-2 divide-dashed divide-y divide-neutral" v-if="visible && !selected">
        <div v-for="(item, index) in filtered" :key="index"
             class="px-3 hover:bg-base-300 cursor-pointer font-xs md:font-3xl"
             :class="{'bg-base-300': hoverIndex === index}"
             @click="select(item.item as ArtistGraphNode)"
             v-html="item.highlighted"
        >
        </div>
      </div>
  </div>
</template>