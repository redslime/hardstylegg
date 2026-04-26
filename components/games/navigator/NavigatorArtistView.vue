<script setup lang="ts">
import {RichArtist, type RichTrack} from "~/types/content";
import SquaresIcon from "~/components/icons/SquaresIcon.vue";
import ListBulletIcon from "~/components/icons/ListBulletIcon.vue";

const { artist, tracks, pending } = defineProps({
  artist: { type: Object as PropType<RichArtist>, required: true },
  tracks: { type: Array as PropType<RichTrack[] | undefined>, required: true },
  pending: { type: Boolean, required: true }
})
const emit = defineEmits<{
  selected: [artist: RichArtist, track: RichTrack]
}>()
const isMobile = inject<boolean>('isMobile', false) as unknown as Ref<boolean>
const compact = ref<boolean>(isMobile.value)

function select(clicked: RichArtist, track: RichTrack) {
  if(clicked.id !== artist.id) {
    emit("selected", clicked, track)
  }
}
</script>

<template>
  <div class="flex gap-2 flex-wrap justify-center relative pt-7">
    <div class="absolute -top-9 left-1 bg-secondary text-secondary-content p-2 rounded-md text-lg sm:text-xl font-black flex gap-2 shadow-lg items-center">
      <img :src="artist.getImageUrl()" class="w-8 h-8 object-cover rounded-full" :alt="artist.getDisplayName()" />
      {{ artist.getDisplayName() }}
    </div>

    <div class="absolute -top-7 right-0 bg-base-300 p-1 rounded-md flex gap-1 shadow-lg items-center">
      <SquaresIcon class="cursor-pointer" :class="{'text-primary': !compact}" @click="compact = false" />
      <ListBulletIcon class="cursor-pointer" :class="{'text-primary': compact}" @click="compact = true" />
    </div>

    <template v-if="!compact">
      <template v-for="index in 24" v-if="pending">
        <div class="rounded-lg shadow p-2 flex flex-col gap-1 justify-start border border-neutral/50 transition-colors">
          <div class="h-[130px] w-[130px] skeleton">
          </div>
          <div class="max-w-[130px]">
            <div class="text-sm skeleton w-26 h-4"></div>
            <div class="text-sm skeleton w-20 h-4 mt-1"></div>
          </div>
        </div>
      </template>

      <template v-for="track in tracks" :key="track!!.sid" v-else>
        <div class="rounded-lg shadow p-2 flex flex-col justify-start gap-1 border border-neutral/50 transition-colors">
          <div class="h-[130px] w-[130px]">
            <img class="w-full overflow-hidden object-cover max-h-[200px] rounded-md"
                 :src="track!!.getImageUrl()" v-if="track!!.image" :alt="track!!.getDisplayName()" />
          </div>
          <div class="max-w-[130px]">
            <div class="text-sm font-semibold">{{ track!!.title }}</div>
            <div class="text-sm opacity-70">
              <template v-for="(ar, index) in track!!.artists" :key="index">
                <template v-if="artist.id !== ar.id">
                  <span class="text-primary hover:underline cursor-pointer" @click="select(ar, track)">
                    {{ ar.getDisplayName() }}
                  </span>
                </template>
                <span v-else>{{ ar.getDisplayName() }}</span>
                <span v-if="index !== track!!.artists.length-1"> & </span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <template v-for="index in 24" v-if="pending">
        <div class="rounded-lg shadow p-2 border border-neutral/50 transition-colors flex items-center">
          <div class="flex justify-start items-center gap-1">
            <div class="h-14 w-14 rounded-xl skeleton" />
            <div>
              <div class="text-sm w-26 h-4 skeleton"></div>
              <div class="text-sm w-20 h-4 mt-1 skeleton"></div>
            </div>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1" v-else>
        <template v-for="track in tracks" :key="track!!.sid">
          <div class="rounded-lg shadow p-2 border border-neutral/50 transition-colors flex items-center">
            <div class="flex justify-start items-center gap-1">
              <img class="h-14 w-14 rounded-md"
                   :src="track!!.getImageUrl()" v-if="track!!.image" :alt="track!!.getDisplayName()" />
              <div>
                <div class="text-sm font-semibold">{{ track!!.title }}</div>
                <div class="text-sm opacity-70">
                  <template v-for="(ar, index) in track!!.artists" :key="index">
                    <template v-if="artist.id !== ar.id">
                      <span class="text-primary hover:underline cursor-pointer" @click="select(ar, track)">
                        {{ ar.getDisplayName() }}
                      </span>
                    </template>
                    <span v-else>{{ ar.getDisplayName() }}</span>
                    <span v-if="index !== track!!.artists.length-1"> & </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>