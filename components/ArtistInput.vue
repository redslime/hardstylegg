<script setup lang="ts">
import type {FlatArtist} from "~/types/content";
import Fuse from "fuse.js";
import {computed, ref} from "vue";
import {useAsyncData} from "#app";
import {getArtists} from "~/utils/contentCache";
import {containsSubstring, delay} from "~/utils/utils";
import {highlight, highlightExact} from "~/utils/fuse";

interface SearchResult {
  item: FlatArtist
  score: number | undefined
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
  highlighted: string
}

const props = defineProps({
  xl: { type: Boolean, required: false }
})
const isMobile = inject<boolean>("isMobile")
const query = ref('')
const fetchProgress = ref(0)
const { data: artistsData } = await useAsyncData('artists-flat', () => getArtists((p) => {
  fetchProgress.value = p
}), {
  lazy: true,
  default: () => []
})
const allOptions = computed(() => artistsData.value || [])
let fuse: Fuse<FlatArtist>
const hoverIndex = ref<number>(-1)
const debouncedQuery = ref('')
const filtered = ref<SearchResult[]>([])
const selected = ref<boolean>(false)
const errorFlash = ref<boolean>(false)
const successFlash = ref<boolean>(false)
const visible = computed(() => query.value.length > 3 && filtered.value.length > 0)
const emit = defineEmits<{
  onSelected: [
      artist: FlatArtist,
      flashError?: (() => Promise<void>),
      flashSuccess?: (() => Promise<void>),
      flashError?: (() => void),
  ]
}>()

// debounce
let timeout: number
watch(query, (val) => {
  if(errorFlash.value) {
    query.value = "Incorrect"
  }

  const trimmed = val.trim()

  if(debouncedQuery.value !== trimmed) {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      debouncedQuery.value = val.trim()
    }, 300)
  }
})

watch(debouncedQuery, async (val) => {
  if(selected.value) filtered.value = []
  if(val.length < 3) filtered.value = []
  if(val.length < 3 || !fuse) filtered.value = []

  // First try: exact substring match
  const exactMatches: SearchResult[] = allOptions.value.filter(st => {
    return st.name.toLowerCase().includes(val.toLowerCase())
  }).map(st => {
    const name = st.name
    return {
      item: st,
      score: 0,
      matches: undefined,
      highlighted: highlightExact(name, containsSubstring(name, val))
    }
  }).slice(0, 5)

  if(exactMatches.length > 0) {
    filtered.value = exactMatches
  } else {
    // Second try: multi-keyword search
    const keywords = val.toLowerCase().split(/\s+/).filter(k => k.length > 2)

    const keywordMatches: SearchResult[] = allOptions.value
        .map(st => {
          const name = st.name.toLowerCase()
          const matchedKeywords = keywords.filter(keyword => name.includes(keyword))

          return {
            artist: st,
            matchCount: matchedKeywords.length,
            matchScore: matchedKeywords.length / keywords.length
          }
        })
        .filter(result => result.matchCount >= Math.min(2, keywords.length)) // At least 2 keywords or all if fewer
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)
        .map(result => {
          // Highlight all matched keywords
          let highlighted = result.artist.name
          keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi')
            highlighted = highlighted.replace(regex, '<b>$1</b>')
          })

          return {
            item: result.artist,
            score: 1 - result.matchScore,
            matches: undefined,
            highlighted
          }
        })

    // Third try: fill up with Fuse.js results if we have fewer than 5
    if (keywordMatches.length < 5) {
      const fuseResults = fuse.search(val)
          .filter(r => val.toLowerCase() !== r.item.name.toLowerCase())
          .map(i => {
            const {item, score, matches} = i
            const artistMatch = matches?.filter(m => m.key === 'artists') ?? []
            const artistHtml = highlight(item.name, artistMatch)
            const highlighted = `${artistHtml}`

            return {
              item, score, matches, highlighted
            }
          })

      // Combine keyword matches with fuse results, avoiding duplicates
      const combined = [...keywordMatches]
      fuseResults.forEach(fr => {
        if (combined.length < 5 && !combined.find(km => km.item.name === fr.item.name)) {
          combined.push(fr)
        }
      })

      filtered.value = combined
    } else {
      filtered.value = keywordMatches
    }
  }
})

function select(item: FlatArtist) {
  query.value = item.name
  selected.value = true
  hoverIndex.value = -1
  emit('onSelected', item, flashError, flashSuccess, clear)
}

function enter() {
  if(visible.value) {
    if(hoverIndex.value != -1) {
      select(filtered.value[hoverIndex.value ?? 0]!!.item as FlatArtist)
    } else {
      const match = allOptions.value.filter(st => {
        return query.value.toLowerCase() == st.name.toLowerCase()
      })

      if(match.length === 1) {
        select(match[0]!!)
      } else {
        flashError()
      }
    }
  }
}

function down() {
  if(visible.value) {
    hoverIndex.value = Math.min(hoverIndex.value+1, filtered.value.length-1)
  }
}

function up() {
  if(visible.value) {
    hoverIndex.value = Math.max(hoverIndex.value-1, 0)
  }
}

async function unfocused() {
  await delay(500)
  selected.value = true
}

const flashError = async () => {
  errorFlash.value = true
  await delay(400)
  errorFlash.value = false
  query.value = ""
}

const flashSuccess = async () => {
  successFlash.value = true
  await delay(400)
  successFlash.value = false
}

const clear = () => {
  query.value = ""
  debouncedQuery.value = ""
  hoverIndex.value = -1
}

const placeholder = computed(() => {
  if(errorFlash.value) {
    return "Incorrect"
  } else {
    return "Artist..."
  }
})

// Expose input bindings and event handlers for slot
const inputBindings = computed(() => ({
  value: query.value,
  class: [
    'input w-full',
    {
      'md:input-xl': props?.xl ?? false,
      'border-error bg-error font-medium text-xl text-error-content text-center uppercase caret-transparent': errorFlash.value,
      'border-success': successFlash.value
    }
  ],
  placeholder: placeholder.value,
  disabled: fetchProgress.value != 100
}))

const inputEvents = {
  input: (e: Event) => {
    query.value = (e.target as HTMLInputElement).value
    hoverIndex.value = -1
    selected.value = false
  },
  keyup: (e: KeyboardEvent) => {
    if (e.key === 'Enter') enter()
    else if (e.key === 'ArrowUp') up()
    else if (e.key === 'ArrowDown') down()
  },
  focusout: unfocused
}

watch(artistsData, (newData) => {
  if (newData) {
    fuse = new Fuse(newData, {
      includeScore: true,
      includeMatches: true,
      keys: ['name']
    })
  }
}, { immediate: true })
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