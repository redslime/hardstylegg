<script setup lang="ts">
import {computed} from "vue";
import {createError} from "h3";
import CircleStackIcon from "~/components/icons/CircleStackIcon.vue";
import SearchInput from "~/components/dashboard/SearchInput.vue";
import BaseTrackCard from "~/components/dashboard/content/BaseTrackCard.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import {useSearchableList} from "~/composables/useSearchableList";
import {getDashboardAlbums, getDashboardArtists, getDashboardTracks} from "~/utils/dashboard";

definePageMeta({
  layout: "dashboard",
  middleware: ["authenticated"],
})

type SearchTarget = "albums" | "artists" | "tracks"

const route = useRoute()

const target = computed<SearchTarget>(() => {
  const value = route.params.target

  if (value === "albums" || value === "artists" || value === "tracks") {
    return value
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Page not found"
  })
})

const pageConfig = computed(() => {
  switch (target.value) {
    case "albums":
      return {
        key: "album",
        title: "Album database",
        fuseKeys: ["title", "artists.name"],
        minQueryLength: 5,
        getSearchText: (item: any) => item.getDisplayName(),
        load: () => getDashboardAlbums()
      }
    case "artists":
      return {
        key: "artist",
        title: "Artist database",
        fuseKeys: ["name"],
        minQueryLength: 3,
        getSearchText: (item: any) => item.getDisplayName(),
        load: () => getDashboardArtists()
      }
    case "tracks":
      return {
        key: "track",
        title: "Track database",
        fuseKeys: ["title", "artists.name"],
        minQueryLength: 5,
        getSearchText: (item: any) => item.getDisplayName(),
        load: () => getDashboardTracks()
      }
  }
})

const { data: items, pending, error } = await useAsyncData(
    `${pageConfig.value.key}`,
    () => pageConfig.value.load(),
    {
      lazy: true,
      watch: [target]
    }
)

const {
  query,
  results: filtered,
  resultsLength: filteredLength,
  minQueryLength
} = useSearchableList(items, {
  minQueryLength: pageConfig.value.minQueryLength,
  debounceMs: 300,
  maxFuseResults: 10,
  fuseKeys: pageConfig.value.fuseKeys,
  getSearchText: pageConfig.value.getSearchText
})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><CircleStackIcon class="size-8" /></span>
    {{ pageConfig.title }}
  </div>

  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div class="w-80" v-if="!pending">
    <SearchInput
        v-model:query="query"
        placeholder="Search"
        :result-count="filteredLength"
        :min-query-length="minQueryLength"
    />
  </div>

  <div class="w-full bg-base-100 rounded-md p-3 h-[1000px] overflow-auto">
    <div v-if="(query?.trim().length ?? 0) < minQueryLength && !pending">
      Begin searching to see results...
    </div>

    <div class="flex flex-wrap gap-2 mt-2">
      <template v-if="target === 'artists'">
        <template v-for="result in filtered" :key="result.item.id">
          <ArtistCard :artist="result.item as any" />
        </template>
      </template>

      <template v-else>
        <template v-for="result in filtered" :key="result.item.sid">
          <BaseTrackCard :item="result.item as any" />
        </template>
      </template>
    </div>
  </div>
</template>