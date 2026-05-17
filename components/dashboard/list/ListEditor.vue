<script setup lang="ts">
import type {List, ListItem} from "~/types/models";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import ArtistPicker from "~/components/dashboard/ArtistPicker.vue";
import ArtistCard from "~/components/dashboard/content/ArtistCard.vue";
import {FlatAlbum, FlatArtist, FlatTrack, remapList, type RichArtist} from "~/types/content";
import TrackPicker from "~/components/dashboard/TrackPicker.vue";
import {updateDashboardList} from "~/utils/dashboard";
import Draggable from "vuedraggable";
import {icons} from "~/components/icons";
import SquaresIcon from "~/components/icons/SquaresIcon.vue";
import ListBulletIcon from "~/components/icons/ListBulletIcon.vue";
import LightBulbIcon from "~/components/icons/LightBulbIcon.vue";
import CompactTrackItemEditor from "~/components/dashboard/list/CompactTrackItemEditor.vue";
import CompactArtistItemEditor from "~/components/dashboard/list/CompactArtistItemEditor.vue";
import PencilIcon from "~/components/icons/PencilIcon.vue";
import ListIcon from "~/components/dashboard/list/ListIcon.vue";
import ListBadge from "~/components/dashboard/list/ListBadge.vue";

const list = defineModel<List>('list', { required: true })
const ready = computed<boolean>(() => list.value !== undefined && list.value.name.length > 0 && list.value.items.length > 1)
const iconModal = ref<HTMLDialogElement | null>()
const inputName = ref<boolean>(false)
const editName = ref<boolean>(false)
const saving = ref<boolean>(false)
const compact = ref<boolean>(false)
const editing = ref<boolean>(list.value?.items.length === 0)

function isOnList(item: RichArtist | FlatTrack | FlatAlbum): boolean {
  if(list.value.type === 'artist') {
    return list.value.items.map(a => (a.item as RichArtist).id).includes((item as RichArtist).id)
  } else {
    return list.value.items.map(a => (a.item as FlatTrack).sid).includes((item as FlatTrack).sid)
  }
}

function addItem(item: RichArtist | FlatTrack | FlatAlbum) {
  if(list.value && list.value.items && !isOnList(item)) {
    list.value.items = [...list.value.items, <ListItem>{
      item,
      index: list.value.items.length
    }]
  }
}

function removeItem(item: ListItem) {
  if(list.value && list.value.items) {
    const newItems = list.value.items.filter(i => i !== item)
    // update indexes
    newItems.forEach((i, idx) => i.index = idx)
    list.value.items = newItems
  }
}

function selectIcon(icon: string) {
  list.value.icon = icon
  iconModal.value?.close()
}

function saveName() {
  if(list.value?.name.length === 0) return
  editName.value = false
  inputName.value = false
}

function back() {
  window.history.back()
}

function tryEditName() {
  if(editing.value) {
    editName.value = true
  }
}

async function save() {
  if(!list.value) return
  saving.value = true

  try {
    await $fetch<List>('/api/dashboard/list', {
      method: 'POST',
      body: list.value
    }).then(list => {
      updateDashboardList(remapList(list))
      navigateTo("/admin/list/")
    })
  } catch (e: any) {
    alert(e.message)
  }
}

watch(list, () => {
  list.value.items.forEach((item, idx) => {
    item.index = idx

  })
}, {deep: true})
</script>

<template>
  <div class="flex items-center gap-2 text-4xl font-bold mb-4">
    <ListIcon :list="list" class="text-primary size-8" />
    <div :class="{'cursor-pointer': editing}" @click="tryEditName()" v-if="!editName">
      {{ list.name }}
    </div>
    <input type="text" class="input w-140" maxlength="512" v-model="list.name" @keydown.enter="saveName()" @focusout="saveName()" v-else />

    <button class="btn btn-sm btn-soft btn-info px-2" @click="editing = true" v-if="!editing">
      <PencilIcon class="scale-70" />
      Edit
    </button>
  </div>

  <div class="flex gap-10" v-if="editing">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">List description</legend>
      <textarea class="textarea w-96" maxlength="2048" v-model="list.description"></textarea>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Icon</legend>

      <div class="flex gap-2 items-center" @click="iconModal?.showModal()">
        <ListIcon :list="list" class="text-primary size-10 cursor-pointer" />
        <p class="opacity-80">(click to change)</p>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Badge preview</legend>
      <ListBadge :list="list" :clickable="false" />
    </fieldset>
  </div>

  <div class="opacity-90" v-else>
    {{ list.description }}
  </div>

  <div class="bg-base-200 p-4 border border-white/10 shadow-md rounded-md mt-10 relative pt-10 max-w-7xl">
    <div class="absolute -top-3 -left-2">
      <div class="badge badge-secondary">
        <span class="font-semibold">List items</span> ({{ list.items.length }})
      </div>
    </div>

    <div class="absolute -top-4 right-2 bg-base-300 p-1 rounded-md flex gap-1 shadow-lg items-center">
      <SquaresIcon class="cursor-pointer" :class="{'text-primary': !compact}" @click="compact = false" />
      <ListBulletIcon class="cursor-pointer" :class="{'text-primary': compact}" @click="compact = true" />
    </div>

    <div class="flex flex-wrap gap-2" :class="{'flex-col': compact}">
      <template v-if="list.type === 'artist'">
        <Draggable
            v-model="list.items"
            item-key="index"
            :animation="200"
            class="flex flex-wrap gap-2"
            :class="{'flex-col': compact}"
            :disabled="!editing"
            :component-data="{
              name: 'flip-list',
              tag: 'div',
             }"
        >
          <template #item="{ element, index }">
            <div class="relative" :class="{'cursor-grab': editing}">
              <template v-if="!compact">
                <ArtistCard :artist="element.item as RichArtist" :clickable="false"/>

                <div class="absolute -top-2 -right-2 flex gap-1">
                  <div class="badge badge-info cursor-pointer px-1 tooltip" @click="compact = true"
                       data-tip="Item has context" v-if="element.context"><LightBulbIcon /></div>
                  <div class="badge badge-error cursor-pointer tooltip" data-tip="Remove item" @click="removeItem(element)" v-if="editing">X</div>
                </div>
              </template>

              <CompactArtistItemEditor v-model:item="element.item" v-model:context="element.context" :editing="editing" v-else />
            </div>
          </template>

          <template #footer v-if="editing">
            <ArtistPicker :title="'Add'" @selected="addItem" :button="false"
                          :existing="list.items.map(i => (i.item as FlatArtist).id)">
              <div class="bg-base-300 rounded-xl p-5 h-[168px] w-[148px] border border-neutral/50 flex flex-col justify-center
             items-center hover:border-success transition-colors cursor-pointer font-bold"
                   :class="{'w-full': compact}">
                <PlusIcon class="text-success size-16" />
                <p class="text-lg font-black">Add</p>
              </div>
            </ArtistPicker>
          </template>
        </Draggable>
      </template>

      <template v-if="list.type === 'track' || list.type === 'album'">
        <Draggable
            v-model="list.items"
            item-key="index"
            :animation="200"
            class="flex flex-wrap gap-2"
            :class="{'flex-col': compact}"
            :disabled="!editing"
            :component-data="{
              name: 'flip-list',
              tag: 'div',
             }"
        >
          <template #item="{ element, index }">
            <div class="relative" :class="{'cursor-grab': editing}">
              <div class="rounded-lg shadow p-2 flex flex-col justify-start border border-neutral/50 h-full bg-base-300" v-if="!compact">
                <div class="h-[130px] w-[130px]">
                  <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-xl"
                       :src="element.item.getImageUrl()" :alt="element.item.getDisplayName()" />
                </div>
                <div class="max-w-[130px]">
                  <div class="text-sm font-semibold">
                    {{ (element.item as FlatTrack).title }}
                  </div>
                  <div class="text-sm opacity-70">
                    {{ (element.item as FlatTrack).getArtistsString() }}
                  </div>
                </div>

                <div class="absolute -top-2 -right-2 flex gap-1">
                  <div class="badge badge-info cursor-pointer px-1 tooltip" @click="compact = true"
                       data-tip="Item has context" v-if="element.context"><LightBulbIcon /></div>
                  <div class="badge badge-error cursor-pointer tooltip" data-tip="Remove item" @click="removeItem(element)" v-if="editing">X</div>
                </div>
              </div>

              <CompactTrackItemEditor v-model:item="element.item" v-model:context="element.context"
                      :editing="editing" @remove="removeItem(element)" v-else />
            </div>
          </template>

          <template #footer v-if="editing">
            <TrackPicker :title="'Add'" @selected="t => addItem(t.toFlatTrack())" :button="false"
                         :albums="list.type === 'album'" :filter="t => !t.hidden"
                         :existing="list.items.map(i => (i.item as FlatTrack).sid)">
              <div class="bg-base-300 rounded-xl p-5 h-full w-[148px] border border-neutral/50 flex flex-col justify-center
             items-center hover:border-success transition-colors cursor-pointer font-bold"
                   :class="{'w-full': compact}">
                <PlusIcon class="text-success size-16" />
                <p class="text-lg font-black">Add</p>
              </div>
            </TrackPicker>
          </template>
        </Draggable>
      </template>
    </div>
  </div>

  <div class="flex gap-2 mt-6">
    <template v-if="editing">
      <button class="btn btn-lg btn-soft" @click="navigateTo('/admin/list')">Cancel</button>
      <button class="btn btn-lg btn-success btn-soft" :disabled="!ready" @click="save()">
        <span v-if="saving" class="loading loading-spinner loading-md"></span>
        <span v-else>Save</span>
      </button>
    </template>
    <template v-else>
      <button class="btn btn-lg btn-soft" @click="back()">Back</button>
    </template>
  </div>

  <dialog ref="iconModal" id="iconModal" class="modal">
    <div class="modal-box">
      <h3 class="text-2xl font-bold text-center mb-4">Select icon</h3>

      <div class="flex flex-wrap gap-2 justify-center">
        <button v-for="(IconComponent, name) in icons" :key="name">
          <component :is="IconComponent" class="size-10 text-primary hover:text-info cursor-pointer object-cover" @click="selectIcon(name)" />
        </button>
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