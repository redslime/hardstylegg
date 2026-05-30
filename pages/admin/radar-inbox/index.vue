<script setup lang="ts">
import InboxIcon from "~/components/icons/InboxIcon.vue";
import type {InboxItem, InboxSlice} from "~/types/models";
import InboxItemCard from "~/components/dashboard/inbox/InboxItemCard.vue";
import type {RichArtist} from "~/types/content";
import {getDashboardArtists, updateDashboardArtist} from "~/utils/dashboard";

definePageMeta({
  middleware: ['authenticated-admin'],
})

const page = ref<number>(1)
const limit = ref<number>(100)
const offset = computed<number>(() => (page.value-1) * limit.value)
const total = computed<number>(() => slice.value?.totalCount ?? 0)
const lastPage = computed<number>(() => Math.ceil(total.value / limit.value))
const renderKey = ref(0)

const { data: slice, pending, error } = useAsyncData<InboxSlice>(() => $fetch(`/api/dashboard/inbox`, {
    query: {
      limit: limit.value,
      offset: offset.value
    }}),
    {
      lazy: true,
      watch: [page]
    })
const { data: artists, pending: ap, refresh } = useAsyncData<RichArtist[]>("artist", () => getDashboardArtists(), { lazy: true })

const submittedItems = ref<InboxItem[]>([])
const importing = ref<boolean>(false)
const selectDay = ref<string>("")

function submit(item: InboxItem) {
  if(!submittedItems.value.includes(item)) {
    submittedItems.value.push(item)
  } else {
    submittedItems.value.splice(submittedItems.value.indexOf(item), 1)
  }
}

function discard(item: InboxItem) {
  if(slice.value) {
    for(const [day, items] of Object.entries(slice.value.items)) {
      if(items.includes(item)) {
        slice.value.items[day] = [...items.filter(i => i !== item)];
      }
    }

    renderKey.value++
  }

  $fetch(`/api/dashboard/inbox/discard`, {
    method: "POST",
    body: item
  })
}

async function newArtists(artists: RichArtist[]) {
  artists.forEach(a => updateDashboardArtist(a))
  await refresh()
  renderKey.value++
}

function sort(items: InboxItem[]): InboxItem[] {
  return items.sort((a, b) => (("tracks" in a) ? 0 : 1) - (("tracks" in b) ? 0 : 1) || String(a.cover_art).localeCompare(String(b.cover_art)))
}

async function importItems() {
  importing.value = true

  try {
    await $fetch("/api/dashboard/inbox/import-items", {
      method: "POST",
      body: submittedItems.value
    })
    window.location.href = `/admin/radar-inbox` // hard refreshes
  } catch (e: any) {
    alert(e.message)
    console.error(e)
  }
  importing.value = false
}
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-8">
    <span class="text-primary"><InboxIcon class="size-8 mt-1" /></span>
    Radar Inbox
  </div>

  <DashboardGameLoadingSpinner :pending="pending || ap" :error="error" />

  <div class="flex flex-col mb-10 gap-3" v-if="slice && artists">
    <div class="bg-base-300 p-3 w-fit rounded-sm text-lg font-bold">
      Items selected to import: {{ submittedItems.length }}

      <div>{{ total }}</div>
      <div class="mt-2">
        <button class="btn btn-soft btn-success" :disabled="submittedItems.length === 0" v-if="!importing" @click="importItems()">
          Import
        </button>
        <button class="btn btn-soft btn-success" disabled v-else>
          <div class="loading loading-spinner"></div>
        </button>
      </div>
    </div>

    <div class="join">
      <input v-for="i in lastPage" @click="page = i"
          class="join-item btn btn-square" type="radio" name="options" :aria-label="`${i}`" :checked="i === 1" />
    </div>
  </div>

  <div :key="renderKey">
    <template v-for="[day, items] of Object.entries(slice.items)" v-if="slice && slice.items" :key="day">
      <div class="bg-secondary text-secondary-content text-xl rounded-sm p-3 w-full my-2 flex justify-between items-center">
        <div>
          {{ day }}
        </div>
        <button class="btn btn-success" @click="selectDay = day">Select all</button>
      </div>

      <div class="flex flex-wrap gap-4" v-if="artists">
        <InboxItemCard v-for="item in sort(items)" :item="item" :artists="artists" :day="day" :selectDay="selectDay" :key="item.sid"
                       @submit="submit" @discard="discard" @newArtists="newArtists" />
      </div>
    </template>
  </div>
</template>
<style scoped>

</style>