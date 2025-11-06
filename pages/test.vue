<script setup lang="ts">
import {onMounted} from "vue";
import {Howl} from "howler";

const playing = ref(false)
const silence = ref<HTMLAudioElement | null>(null)
let howl: Howl | null = null

onMounted(() => {
  howl = new Howl({
    src: [`/heardle/7b827509-33c4-4083-bb3c-7a36d751d76d.mp3`],
    preload: true,
    volume: 0.2
  });
})

function unlockIOSAudio() {
  silence.value?.play().catch(() => {})
}

async function play() {
  unlockIOSAudio()
  await nextTick()
  howl?.play()
  playing.value = true
}
</script>

<template>
  <audio ref="silence" id="silent-audio" preload="auto">
    <source src="/silence.mp3" type="audio/mp3">
  </audio>
  <button class="btn btn-primary btn-outline" @click="play()">play very cool song</button>
  <p v-if="playing">ya hear it?</p>
</template>

<style scoped>

</style>