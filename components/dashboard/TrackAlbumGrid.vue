<script setup lang="ts">
import Fuse from "fuse.js";
import Grid from "vue-virtual-scroll-grid";
import {RichAlbum, RichTrack} from "~/types/content";
import {useSearchableList} from "~/composables/useSearchableList";
import SearchInput from "~/components/dashboard/SearchInput.vue";
import {ref} from "vue";

interface SearchResult {
  item: RichTrack;
  score: number | undefined;
  matches: ReadonlyArray<Fuse.FuseResultMatch> | undefined;
}

const emit = defineEmits<{
  selected: [track: RichTrack]
}>()
const { items, albums, title, selectable, existing } = defineProps({
  items: { type: Array as PropType<RichTrack[] | RichAlbum[]>, required: true },
  albums: { type: Boolean, default: false },
  title: { type: String, default: "Select" },
  hideTitle: { type: Boolean, default: false },
  selectable: { type: Boolean, default: true },
  existing: { type: Array as PropType<string[]>, default: [] }
})

const mode = albums ? "album" : "track"

function select(result: SearchResult) {
  if(selectable) {
    query.value = ""
    emit("selected", result.item)
  }
}

const {
  query,
  resultsLength: filteredLength,
  minQueryLength,
  computedPageProvider
} = useSearchableList(ref(items), {
  minQueryLength: 5,
  debounceMs: 300,
  maxFuseResults: 10,
  fuseKeys: ["name"],
  getSearchText: a => a.getDisplayName()
})
</script>

<template>
  <h3 class="text-2xl font-bold text-white" v-if="!hideTitle">{{ title }} {{ mode }}</h3>

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
</template>

<style scoped>

</style>