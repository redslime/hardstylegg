<script setup lang="ts">
import type {OrderContainer} from "~/types/gameModels";
import {getOrderData} from "~/utils/dashboard";
import {computed} from "vue";
import DashboardGameLoadingSpinner from "~/components/dashboard/DashboardGameLoadingSpinner.vue";
import {validateOrder} from "~/utils/gameValidators";
import ArrowsRightLeft from "~/components/icons/game/ArrowsRightLeft.vue";
import Draggable from "vuedraggable";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import type {Track} from "~/types/models";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated'],
})

const { data, pending, error } = await useAsyncData<OrderContainer[]>(() => getOrderData(), { lazy: true })
const instances = computed<OrderContainer[] | undefined>(() => data.value)
const editing = ref<OrderContainer | undefined>()

function del(index: number) {
  editing.value!!.items.splice(index, 1)
}

function add(track: Track) {
  editing.value!!.items.push({track: track, index: editing.value!!.items.length})
}

function update() {
  for(let i = 0; i < editing.value!!.items.length; i++) {
    console.log(editing.value!!.items[i]!!.track.title + " is at " + i);
    editing.value!!.items[i]!!.index = i;
  }
}
</script>

<template>
  <DashboardGameLoadingSpinner :pending="pending" :error="error" />

  <div v-if="data">
    <DashboardGameEditor
        v-model:instances="instances"
        v-model:editing="editing"
        :validator="() => validateOrder(editing!!)"
        :editUrl="'/api/dashboard/edit/order'"
        :typeId="6"
        :typeName="'Order'"
        :icon="ArrowsRightLeft"
        :title="t => t.title"
    >
      <template #previewBody="{ instance }">
        <div class="w-full flex gap-2">
          <div class="shrink w-1/4 sm:w-1/3 xs:w-1/2" v-for="item in instance.items" :key="item.track.sid">
            <img
                :src="`${getSpotifyArtwork(item.track.cover_art)}`"
                :alt="item.track.title"
                class="w-full h-auto rounded-xl shrink shadow-md"
            />
          </div>
        </div>
      </template>

      <template #editTitle v-if="editing">
        <input type="text" placeholder="Quiz title" required maxlength="128"
               class="input input-lg validator w-[50ch] focus:outline-none focus:ring-0"
               v-model="editing.title" />
      </template>

      <template #editBody v-if="editing">
        <Draggable
            v-model="editing.items"
            item-key="name"
            :animation="200"
            class="flex gap-2 max-w-[1000px]"
            :component-data="{
              name: 'flip-list',
              tag: 'div',
             }"
            @update="update"
        >
          <template #item="{ element, index }">
            <div
                :key="element.index"
                class="relative cursor-grab shrink w-1/4 sm:w-1/3 xs:w-1/2 active:cursor-grabbing transform transition-transform duration-300 ease-in-out"
            >
              <img
                  :src="`${getSpotifyArtwork(element.track.cover_art)}`"
                  :alt="element.track.title"
                  class="w-full h-auto shrink object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-200 ease-in-out"
              />
              <div class="absolute top-1 right-1">
                <div class="badge badge-error cursor-pointer" @click="del(index)">X</div>
              </div>
            </div>
          </template>
        </Draggable>

        <div class="my-3 text-center text-sm text-base-content/40" v-if="editing.showNames">
          Current order:
          <span class="font-semibold text-base-content/45">
            {{ editing!!.items.map(i => i.track.title).join(' → ') }}
          </span>
        </div>

        <div class="mt-5">
          <TrackPicker :title="'Add'" @selected="t => add(t)" :disabled="editing.items.length >= 6" />
        </div>

        <label class="flex label mt-8">
          <input v-model="editing.showNames" class="checkbox checkbox-success" type="checkbox" checked="checked" />
          Show names
        </label>
      </template>
    </DashboardGameEditor>
  </div>
</template>

<style scoped>
.flip-list-move {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>