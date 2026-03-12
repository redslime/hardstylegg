<script setup lang="ts">
import Fuse from 'fuse.js'
import {computed, onMounted, ref} from 'vue'
import {getAlbums, getTracks} from "~/utils/contentCache";
import {containsSubstring, delay} from "~/utils/utils";
import {useAsyncData} from "#app";
import {BaseTrack} from "~/types/content";
import {highlight, highlightExact} from "~/utils/fuse";

interface SearchResult {
  item: BaseTrack;
  score: number | undefined;
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
  highlighted: string
}

const { xl, isAlbums, titleOnly } = defineProps({
  xl: { type: Boolean, required: false },
  isAlbums: { type: Boolean, default: false },
  titleOnly: { type: Boolean, default: false }
})
const isMobile = inject<boolean>("isMobile")
const query = ref('')
const fetchProgress = ref(0)
const mode = isAlbums ? "albums" : "tracks"
const { data: albumsData } = await useAsyncData(`${mode}-flat`, () => isAlbums ? getAlbums((p) => {
  fetchProgress.value = p
}) : getTracks((p) => {
  fetchProgress.value = p
}), {
  lazy: true,
  default: () => []
})
const allOptions = computed(() => albumsData.value || [])
let fuse: Fuse<BaseTrack>
const hoverIndex = ref<number>(-1)
const debouncedQuery = ref('')
const filtered = ref<SearchResult[]>([])
const selected = ref<boolean>(false)
const errorFlash = ref<boolean>(false)
const successFlash = ref<boolean>(false)
const visible = computed(() => query.value.length > 3 && filtered.value.length > 0)
const emit = defineEmits(['onSelected'])

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
    return st.getDisplayName(titleOnly).toLowerCase().includes(val.toLowerCase())
  }).map(st => {
    const name = st.getDisplayName(titleOnly)
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
        const name = st.getDisplayName(titleOnly).toLowerCase()
        const matchedKeywords = keywords.filter(keyword => name.includes(keyword))
        
        return {
          album: st,
          matchCount: matchedKeywords.length,
          matchScore: matchedKeywords.length / keywords.length
        }
      })
      .filter(result => result.matchCount >= Math.min(2, keywords.length)) // At least 2 keywords or all if fewer
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map(result => {
        // Highlight all matched keywords
        let highlighted = result.album.getDisplayName(titleOnly)
        keywords.forEach(keyword => {
          const regex = new RegExp(`(${keyword})`, 'gi')
          highlighted = highlighted.replace(regex, '<b>$1</b>')
        })
        
        return {
          item: result.album,
          score: 1 - result.matchScore,
          matches: undefined,
          highlighted
        }
      })

    // Third try: fill up with Fuse.js results if we have fewer than 5
    if (keywordMatches.length < 5) {
      const fuseResults = fuse.search(val)
          .filter(r => val.toLowerCase() !== r.item.getDisplayName(titleOnly).toLowerCase())
          .map(i => {
            const {item, score, matches} = i
            const artistMatch = matches?.filter(m => m.key === 'artists') ?? []
            const titleMatch = matches?.filter(m => m.key === 'title') ?? []
            const artistHtml = highlight(item.getArtistsString(), artistMatch)
            const titleHtml = highlight(item.title, titleMatch)
            const highlighted = `${artistHtml} - ${titleHtml}`

            return {
              item, score, matches, highlighted
            }
          })

      // Combine keyword matches with fuse results, avoiding duplicates
      const combined = [...keywordMatches]
      fuseResults.forEach(fr => {
        if (combined.length < 5 && !combined.find(km => km.item.getDisplayName(titleOnly) === fr.item.getDisplayName(titleOnly))) {
          combined.push(fr)
        }
      })
      
      filtered.value = combined
    } else {
      filtered.value = keywordMatches
    }
  }
})

function select(item: BaseTrack) {
  query.value = item.getDisplayName(titleOnly)
  selected.value = true
  hoverIndex.value = -1
  emit('onSelected', item, flashError, flashSuccess, clear)
}

function enter() {
  if(visible.value) {
    if(hoverIndex.value != -1) {
      select(filtered.value[hoverIndex.value ?? 0]!!.item as BaseTrack)
    } else {
      const match = allOptions.value.filter(st => {
        const name = st.getDisplayName(titleOnly)
        return query.value.toLowerCase() == name.toLowerCase()
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

watch(albumsData, (newData) => {
  if (newData) {
    fuse = new Fuse(newData, {
      includeScore: true,
      includeMatches: true,
      keys: ['title', 'artists']
    })
  }
}, { immediate: true })

onMounted(() => {
  if(albumsData.value && albumsData.value.length > 0) {
    fuse = new Fuse(albumsData.value, {
      includeScore: true,
      includeMatches: true,
      keys: ['title', 'artists']
    })
  }
})

const placeholder = computed(() => {
  if(errorFlash.value) {
    return "Incorrect"
  } else {
    return isAlbums ? "Album..." : "Track..."
  }
})

// Expose input bindings and event handlers for slot
const inputBindings = computed(() => ({
  value: query.value,
  class: [
    'input w-full',
    {
      'md:input-xl': xl ?? false,
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
