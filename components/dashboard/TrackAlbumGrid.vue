<script setup lang="ts">
import {ref} from "vue";
import Fuse from "fuse.js";
import Grid from "vue-virtual-scroll-grid";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import {deleteAlbum, deleteTrack} from "~/utils/dashboard";
import {RichAlbum, RichTrack} from "~/types/content";

interface SearchResult {
  item: RichTrack;
  score: number | undefined;
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
}

const emit = defineEmits(['selected'])
const { items, albums, title, selectable, editable, existing } = defineProps({
  items: { type: Array as PropType<RichTrack[] | RichAlbum[]>, required: true },
  albums: { type: Boolean, default: false },
  title: { type: String, default: "Select" },
  hideTitle: { type: Boolean, default: false },
  selectable: { type: Boolean, default: true },
  editable: { type: Boolean, default: false },
  existing: { type: Array as PropType<string[]>, default: [] }
})

const mode = albums ? "album" : "track"

const fuse = new Fuse(items, {
  includeScore: true,
  includeMatches: true,
  keys: ['title', 'artists']
})
const query = ref<string>("");
const filtered = ref<SearchResult[]>([])
const filteredLength = ref<number>(0)
const debouncedQuery = ref('')

const editingModal = ref<HTMLDialogElement | null>();
const editingItem = ref<RichTrack | RichAlbum | null>(null);
const editingSaving = ref<boolean>(false)
const editingResponse = ref<boolean | undefined>()
const editingError = ref<string | undefined>()

const deletingModal = ref<HTMLDialogElement | null>();
const deletingItem = ref<RichTrack | RichAlbum | null>(null);
const deletingSaving = ref<boolean>(false)
const deletingResponse = ref<boolean | undefined>()

function select(result: SearchResult) {
  if(selectable) {
    query.value = ""
    emit("selected", result.item)
  }
}

async function edit(result: SearchResult) {
  editingItem.value = result.item
  await nextTick()
  editingModal.value?.showModal()
}

async function promptDelete(result: SearchResult) {
  deletingItem.value = result.item
  await nextTick()
  deletingModal.value?.showModal()
}

async function del() {
  if(!deletingItem || !deletingItem.value) return

  deletingSaving.value = true
  deletingResponse.value = undefined

  try {
    // delete from database
    await $fetch(albums ? "/api/dashboard/delete/album" : "/api/dashboard/delete/track", {
      method: "POST",
      body: deletingItem.value
    })

    // delete from local data
    const index = items.indexOf(deletingItem.value as RichAlbum)
    items.splice(index, 1)

    // update grid
    filtered.value = filtered.value.filter(item => item.item !== deletingItem.value)
    filteredLength.value = filteredLength.value - 1

    // delete from fuse
    fuse.remove((doc, _) => doc.sid === deletingItem.value?.sid)

    // delete from cache
    if(deletingItem.value instanceof RichAlbum) {
      deleteAlbum(deletingItem.value)
    } else {
      deleteTrack(deletingItem.value)
    }

    deletingResponse.value = true
  } catch(e: any) {
    console.log("failed to delete ", deletingItem.value, "error: ", e.message)
  } finally {
    deletingSaving.value = false
    deletingModal.value?.close()
  }
}

async function saveEditing() {
  if(!editingItem || !editingItem.value) return

  editingSaving.value = true
  editingResponse.value = undefined

  try {
    await $fetch(albums ? "/api/dashboard/edit/album" : "/api/dashboard/edit/track", {
      method: "POST",
      body: editingItem.value
    })

    editingResponse.value = true
  } catch(e: any) {
    console.log("failed to edit ", editingItem.value, "error: ", e.message)
    editingError.value = e.message
  } finally {
    editingSaving.value = false
    editingModal.value?.close()
  }
}

// debounce
let timeout: number
watch(query, (val) => {
  const trimmed = val.trim()

  if(debouncedQuery.value !== trimmed) {
    clearTimeout(timeout)
    filteredLength.value = 0
    timeout = window.setTimeout(() => {
      debouncedQuery.value = val.trim()
    }, 300)
  }
})

watch(debouncedQuery, async (val) => {
  if(val.length < 5 || !fuse) {
    filtered.value = []
    filteredLength.value = 0
    return
  }

  // First try: exact substring match
  const exactMatches: SearchResult[] = items.filter(st => {
    return st.getDisplayName().toLowerCase().includes(val.toLowerCase())
  }).map(st => {
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

    const keywordMatches: SearchResult[] = items
        .map(st => {
          const matchedKeywords = keywords.filter(keyword => st.getDisplayName().toLowerCase().includes(keyword))

          return {
            track: st,
            matchCount: matchedKeywords.length,
            matchScore: matchedKeywords.length / keywords.length
          }
        })
        .filter(result => result.matchCount >= Math.min(2, keywords.length)) // At least 2 keywords or all if fewer
        .sort((a, b) => b.matchScore - a.matchScore)
        .map(result => {
          // Highlight all matched keywords
          let highlighted = result.track.getDisplayName()
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
          .filter(r => val.toLowerCase() !== r.item.title.toLowerCase())
          .map(i => {
            const {item, score, matches} = i
            return {item, score, matches}
          })

      // Combine keyword matches with fuse results, avoiding duplicates
      const combined = [...keywordMatches]
      fuseResults.forEach(fr => {
        if (combined.length < 5 && !combined.find(km => km.item.title === fr.item.title)) {
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
</script>

<template>
  <h3 class="text-2xl font-bold text-white" v-if="!hideTitle">{{ title }} {{ mode }}</h3>

  <label class="input my-3">
    <SearchIcon />
    <input type="text" class="grow" placeholder="Search" v-model="query" />
    {{ filteredLength }}
  </label>

  <div class="w-full bg-base-100 rounded-md p-3 h-[1000px] overflow-auto">
    <div v-if="(query?.trim().length ?? 0) < 5">
      Begin searching to see results...
    </div>

    <Grid
        v-else
        class="h-full grid 2xl:grid-cols-5 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
        :length="filteredLength"
        :pageProvider="computedPageProvider"
        :pageSize="100"
    >
      <template v-slot:placeholder="{ style }">
        <div :style="style" class="p-2">
          <div class="h-full bg-base-200 rounded-lg animate-pulse p-3"></div>
        </div>
      </template>

      <template v-slot:default="{ item, style }">
        <div :style="style" class="p-2">
          <div
              class="h-full bg-base-200 rounded-lg shadow p-2 flex flex-col justify-start"
              :class="{
                'cursor-pointer hover:outline-1 outline-primary': selectable,
                'outline-1 outline-warning': existing.includes(item.item.sid),
                'outline-1 outline-neutral': item.item.hidden
              }"
              @click="select(item)"
          >
            <div class="flex justify-center mb-2" v-if="existing.includes(item.item.sid)">
              <div class="badge badge-soft badge-warning">Already exists</div>
            </div>
            <div class="flex justify-center mb-2" v-if="item.item.hidden">
              <div class="badge badge-soft">Hidden</div>
            </div>
            <div class="relative group">
              <img class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.item.image}`" alt="" />
              <div v-if="editable" class="absolute z-10 inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button class="btn btn-sm btn-outline btn-primary" @click="edit(item)">Edit</button>
                <button class="btn btn-sm btn-outline btn-error" @click="promptDelete(item)">Delete</button>
              </div>
            </div>
            <div class="text-lg font-semibold">{{ item.item.title }}</div>
            <div class="text-sm opacity-70">{{ item.item.getArtistsString() }}</div>
            <div class="text-xs opacity-70">{{ item.item.year }}</div>
          </div>
        </div>
      </template>

      <template v-slot:probe>
        <div class="">Probe</div>
      </template>
    </Grid>
  </div>

  <dialog ref="editingModal" id="editingModal" class="modal" v-if="editingItem">
    <div class="modal-box max-w-1/2" v-if="!editingSaving">
      <div class="flex flex-col justify-center items-center gap-1">
        <img class="w-full overflow-hidden object-contain max-h-[300px] mb-2" :src="`https://i.scdn.co/image/${editingItem.image}`" alt="" />
        <input class="input w-xl text-center input-lg text-lg font-semibold" v-model="editingItem.title" />
        <input class="input w-xl text-sm text-center opacity-70" :value="editingItem.getArtistsString()" readonly />
        <input class="input w-20 text-xs text-center opacity-70" type="number" v-model="editingItem.year" />

        <div class="flex gap-3 self-start mt-7">
          <button class="btn btn-soft btn-success" @click="saveEditing()">Save</button>
          <button class="btn btn-neutral" @click="editingModal?.close(); editingItem = null">Cancel</button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="modal-box" v-if="editingResponse === undefined">
        <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Saving...</h3>
      </div>
      <div class="modal-box" v-else-if="editingResponse">
        <h3 class="text-xl font-bold text-center">Saved successfully</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <div class="modal-box" v-else-if="editingError">
        <h3 class="text-xl font-bold text-center text-error">Error</h3>
        <p>{{ editingError }}</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </div>
  </dialog>

  <dialog ref="deletingModal" id="deletingModal" class="modal" v-if="deletingItem">
    <div class="modal-box" v-if="!deletingSaving">
      <div class="text-xl font-bold text-center">
        Are you sure you want to delete?
      </div>
      <div class="flex justify-center mt-5 gap-3">
        <button class="btn btn-outline btn-lg btn-error" @click="del()">Delete</button>
        <button class="btn btn-neutral btn-lg" @click="deletingModal?.close(); deletingModal = null">Cancel</button>
      </div>
    </div>
    <div v-else>
      <div class="modal-box" v-if="deletingResponse === undefined">
        <h3 class="text-xl font-bold text-center"><span class="loading loading-spinner loading-md"></span> Deleting...</h3>
      </div>
      <div class="modal-box" v-else-if="deletingResponse">
        <h3 class="text-xl font-bold text-center">Deleted successfully</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <div class="modal-box" v-else>
        <h3 class="text-xl font-bold text-center text-error">Error</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>