<script setup lang="ts">
import Fuse from "fuse.js";
import {ref} from "vue";
import Grid from "vue-virtual-scroll-grid";
import {type RichArtist} from "~/types/content";
import {useSearchableList} from "~/composables/useSearchableList";
import SearchInput from "~/components/dashboard/SearchInput.vue";

interface SearchResult {
  item: RichArtist;
  score: number | undefined;
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
}

const emit = defineEmits(['selected'])
const { items, title, selectable, existing } = defineProps({
  items: { type: Array as PropType<RichArtist[]>, required: true },
  title: { type: String, default: "Select" },
  hideTitle: { type: Boolean, default: false },
  selectable: { type: Boolean, default: true },
  existing: { type: Array as PropType<string[]>, default: [] }
})

const editingModal = ref<HTMLDialogElement | null>();
const editingItem = ref<RichArtist | null>(null);
const editingSaving = ref<boolean>(false)
const editingResponse = ref<boolean | undefined>()
const editingError = ref<string | undefined>()

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

async function saveEditing() {
  if(!editingItem || !editingItem.value) return

  editingSaving.value = true
  editingResponse.value = undefined

  try {
    await $fetch("/api/dashboard/edit/artist", {
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

const {
  query,
  resultsLength: filteredLength,
  minQueryLength,
  computedPageProvider
} = useSearchableList(ref(items), {
  minQueryLength: 3,
  debounceMs: 300,
  maxFuseResults: 10,
  fuseKeys: ["name"],
  getSearchText: a => a.getDisplayName()
})
</script>

<template>
  <h3 class="text-2xl font-bold text-white" v-if="!hideTitle">{{ title }} artists</h3>

  <div class="flex justify-center">
    <div class="my-3 w-2/5">
      <SearchInput
          v-model:query="query"
          placeholder="Search"
          :result-count="filteredLength"
          :min-query-length="minQueryLength"
      />
    </div>
  </div>

  <div class="w-full bg-base-100 rounded-md p-3 h-[1000px] overflow-auto">
    <div v-if="(query?.trim().length ?? 0) < minQueryLength">
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
                'outline-1 outline-warning': existing.includes(item.item.id),
              }"
              @click="select(item)"
          >
            <div class="flex justify-center mb-2" v-if="existing.includes(item.item.id)">
              <div class="badge badge-soft badge-warning">Already exists</div>
            </div>
            <div class="relative group">
              <img v-if="item.item.image" class="w-full overflow-hidden object-contain max-h-[200px]" :src="`https://i.scdn.co/image/${item.item.image}`" alt="" />
              <div v-if="!item.item.image" class="w-full min-h-[200px] rounded-xl bg-base-300 flex items-center justify-center border-2 border-dashed border-base-content/20">
                <span class="text-xs opacity-50 text-center px-1">No image</span>
              </div>
            </div>
            <div class="text-lg font-semibold text-center">{{ item.item.name }}</div>
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
        <input class="input w-xl text-center input-lg text-lg font-semibold" v-model="editingItem.name" />

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
</template>

<style scoped>

</style>