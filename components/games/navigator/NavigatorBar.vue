<script setup lang="ts">
import ArrowRightIcon from "~/components/icons/ArrowRightIcon.vue";
import type {RichArtist} from "~/types/content";
import {GameState} from "~/types/models";
import Xmark from "~/components/icons/Xmark.vue";
import type {OptionalNavigatorStep} from "~/components/games/navigator/NavigatorGame.vue";

const { stepsLeft, currentStep, state, from, to, steps, flipTooltip } = defineProps({
  stepsLeft: { type: Number, required: true },
  currentStep: { type: Number, required: true },
  state: { type: Number as PropType<GameState>, required: true },
  from: { type: Object as PropType<RichArtist>, required: true },
  to: { type: Object as PropType<RichArtist>, required: true },
  steps: { type: Array as PropType<OptionalNavigatorStep[]>, required: true },
  flipTooltip: { type: Boolean, default: false }
})
const isMobile = inject<boolean>('isMobile')
const summary = inject<boolean>("summary", false)
</script>

<template>
  <div class="flex justify-center">
    <div class="border border-white/20 p-2 rounded-md flex gap-3 sm:gap-5 bg-base-200 indicator">
      <span class="indicator-item indicator-center badge badge-sm md:badge-md"
            :class="{'badge-success': stepsLeft > 1, 'badge-warning': stepsLeft == 1, 'badge-error': stepsLeft == 0 }"
            v-if="state !== GameState.SUCCEEDED">
        Steps left: {{ stepsLeft }}
      </span>

      <div class="tooltip" :class="{'tooltip-bottom': flipTooltip}" :data-tip="from.getDisplayName()">
        <img :src="from.getImageUrl()" class="rounded-full w-10 md:w-15 h-10 md:h-15 overflow-hidden object-cover" :alt="from.getDisplayName()" />
      </div>
      <template v-for="(step, index) in steps" :key="index">
        <template v-if="index <= currentStep">
          <div class="content-center -mx-1" :class="{'-mx-4': summary && !isMobile}">
            <ArrowRightIcon class="size-6 md:size-8" />
          </div>
          <div class="content-center" v-if="!step">
            <span class="loading loading-ring md:loading-xl"></span>
          </div>

          <div class="tooltip" :class="{'tooltip-bottom': flipTooltip}" :data-tip="step.artist.getDisplayName()" v-else>
            <img :src="step.artist.getImageUrl()" class="rounded-full w-10 md:w-15 h-10 md:h-15 overflow-hidden object-cover" :alt="step.artist.getDisplayName()" />
          </div>
        </template>
      </template>
      <div class="content-center -mx-1" :class="{'-mx-4': summary && !isMobile}">
        <ArrowRightIcon class="size-6 md:size-8" v-if="state !== GameState.FAILED" />
        <Xmark class="size-6 md:size-8 text-error" v-else />
      </div>
      <div class="tooltip" :class="{'tooltip-bottom': flipTooltip}" :data-tip="to.getDisplayName()">
        <img :src="to.getImageUrl()" class="rounded-full w-10 md:w-15 h-10 md:h-15 overflow-hidden object-cover" :alt="to.getDisplayName()" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>