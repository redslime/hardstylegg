<script setup lang="ts">
import {computed, ref} from "vue"
import {useSelectableSearchInput} from "~/composables/useSelectableSearchInput"

const props = defineProps({
  xl: { type: Boolean, required: false }
})

const isMobile = inject<boolean>("isMobile")
const query = ref("")
const fetchProgress = ref(100)
const filtered = computed(() => [])
const allOptions = computed(() => [])

const emit = defineEmits<{
  onTextInput: [
    text: string,
    inputFeedback: (success: boolean) => boolean
  ]
}>()

const {
  errorFlash,
  successFlash,
  inputBindings,
  inputEvents
} = useSelectableSearchInput<string>({
  query,
  filtered,
  allOptions,
  getItemLabel: (item) => item,
  onSelect: () => {},
  onTextEnter: (value, inputFeedback) => {
    emit("onTextInput", value, inputFeedback)
  },
  defaultPlaceholder: "",
  fetchProgress,
  xl: computed(() => props.xl),
  textMode: true
})
</script>

<template>
  <div class="relative">
    <Teleport to="#top-dock" :disabled="!isMobile">
      <div class="relative">
        <slot
            :inputBindings="inputBindings"
            :inputEvents="inputEvents"
            :errorFlash="errorFlash"
            :successFlash="successFlash"
        >
          <input
              v-bind="inputBindings"
              v-on="inputEvents"
          />
        </slot>
      </div>
    </Teleport>
  </div>
</template>