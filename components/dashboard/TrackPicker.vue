<script setup lang="ts">
import SearchIcon from "~/components/icons/SearchIcon.vue";
import type {Track} from "~/types/models";
import Fuse from "fuse.js";
import {onMounted, ref} from "vue";
import Grid from "vue-virtual-scroll-grid"
import {getDashboardAlbums, getDashboardTracks} from "~/utils/dashboard";

const { albums, title } = defineProps({
  albums: { type: Boolean, default: false },
  title: { type: String, default: "Select" }
})
const emit = defineEmits(['selected'])
const mode = albums ? "album" : "track"
const modal = ref<HTMLDialogElement | null>();
const query = ref<string>("");
const allOptions: Track[] = await(mode === "album" ? getDashboardAlbums() : getDashboardTracks())

function select(result: SearchResult) {
  modal.value?.close()
  query.value = ""
  emit("selected", result.item)
}

let fuse: Fuse<typeof allOptions[0]>
const filtered = ref<SearchResult[]>([])
const filteredLength = ref<number>(0)
const debouncedQuery = ref('')
interface SearchResult {
  item: Track;
  score: number | undefined;
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
}

// debounce
let timeout: number
watch(query, (val) => {
  clearTimeout(timeout)
  filteredLength.value = 0
  timeout = window.setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

watch(debouncedQuery, async (val) => {
  if(val.length < 5 || !fuse) {
    filtered.value = []
    filteredLength.value = 0
    return
  }

  // First try: exact substring match
  const exactMatches: SearchResult[] = allOptions.filter(st => {
    const name = st.artists + " - " + st.title
    return name.toLowerCase().includes(val.toLowerCase())
  }).map(st => {
    const name = st.artists + " - " + st.title
    return {
      item: st,
      score: 0,
      matches: undefined
    }
  })

  if(exactMatches.length > 0) {
    filtered.value = exactMatches
  } else {
    // Second try: multi-keyword search
    const keywords = val.toLowerCase().split(/\s+/).filter(k => k.length > 2)

    const keywordMatches: SearchResult[] = allOptions
        .map(st => {
          const name = (st.artists + " - " + st.title).toLowerCase()
          const matchedKeywords = keywords.filter(keyword => name.includes(keyword))

          return {
            track: st,
            matchCount: matchedKeywords.length,
            matchScore: matchedKeywords.length / keywords.length
          }
        })
        .filter(result => result.matchCount >= Math.min(2, keywords.length)) // At least 2 keywords or all if fewer
        .sort((a, b) => b.matchScore - a.matchScore)
        .map(result => {
          const name = result.track.artists + " - " + result.track.title
          // Highlight all matched keywords
          let highlighted = name
          keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi')
            highlighted = highlighted.replace(regex, '<span class=""><b>$1</b></span>')
          })

          return {
            item: result.track,
            score: 1 - result.matchScore,
            matches: undefined,
            highlighted
          }
        })

    // Third try: fill up with Fuse.js results if we have fewer than 5
    if (keywordMatches.length < 5) {
      const fuseResults = fuse.search(val)
          .filter(r => val.toLowerCase() !== getName(r.item).toLowerCase())
          .map(i => {
            const {item, score, matches} = i
            return {item, score, matches}
          })

      // Combine keyword matches with fuse results, avoiding duplicates
      const combined = [...keywordMatches]
      fuseResults.forEach(fr => {
        if (combined.length < 5 && !combined.find(km => getName(km.item) === getName(fr.item))) {
          combined.push(fr)
        }
      })

      filtered.value = combined
    } else {
      filtered.value = keywordMatches
    }
  }

  filteredLength.value = filtered.value.length
})

const computedPageProvider = computed(() => {
  const copyComputed = filtered.value // required to trigger re-calculation
  return async function pageProvider(pageNumber: number, pageSize: number) {
    const start = pageNumber * pageSize
    const end = Math.min(start + pageSize, filteredLength.value)
    return filtered.value.slice(start, end)
  }
})

onMounted(() => {
  fuse = new Fuse(allOptions, {
    includeScore: true,
    includeMatches: true,
    keys: ['title', 'artists']
  })
})
</script>

<template>
  <button class="btn btn-soft btn-primary" @click="modal?.showModal()">{{ title }} {{ mode }}</button>

  <dialog id="trackPickerModal" ref="modal" class="modal">
    <div class="modal-box max-w-4/5 bg-base-300">
      <h3 class="text-2xl font-bold">{{ title }} {{ mode }}</h3>

      <label class="input focus-within:outline-none focus-within:ring-0 my-3">
        <SearchIcon />
        <input type="text" class="grow" placeholder="Search" v-model="query" />
        {{ filteredLength }}
      </label>

      <div class="w-full bg-base-100 rounded-md p-3 h-[1000px] overflow-auto">
        <div v-if="(query?.length ?? 0) < 5">
          Begin searching to see results...
        </div>

        <Grid
            v-else
            class="h-full grid 2xl:grid-cols-5 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
            :length="filteredLength"
            :pageProvider="computedPageProvider"
            :pageSize="100"
        >
          <template v-slot:placeholder="{ index, style }">
            <div :style="style" class="p-2">
              <div class="h-full bg-base-200 rounded-lg animate-pulse p-3"></div>
            </div>
          </template>

          <template v-slot:default="{ item, style, index }">
            <div :style="style" class="p-2">
              <div
                  class="h-full bg-base-200 rounded-lg shadow hover:shadow-lg cursor-pointer p-2 flex flex-col justify-start"
                  @click="select(item)"
              >
                <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.item.cover_art}`" alt="" />
                <div class="text-lg font-semibold">{{ item.item.title }}</div>
                <div class="text-sm opacity-70">{{ item.item.artists }}</div>
              </div>
            </div>
          </template>

          <template v-slot:probe>
            <div class="">Probe</div>
          </template>
        </Grid>
      </div>

      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>