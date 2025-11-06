<script setup lang="ts">
import {onMounted} from "vue";
import {Howl} from "howler";

const playing = ref(false)
let howl: Howl | null = null

onMounted(() => {
  howl = new Howl({
    src: [`/heardle/7b827509-33c4-4083-bb3c-7a36d751d76d.mp3`],
    preload: true,
    volume: 0.2
  });
})

function unlockIOSAudio() {
  const silent = document.getElementById("silent-audio") as HTMLAudioElement
  silent.volume = 0
  silent.play().catch(() => {})
}

function play() {
  unlockIOSAudio()
  howl?.play()
  playing.value = true
}
</script>

<template>
  <audio id="silent-audio" playsinline preload="auto">
    <source src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" type="audio/mp3">
  </audio>
  <button class="btn btn-primary btn-outline" @click="play()">play very cool song</button>
  <p v-if="playing">ya hear it?</p>
</template>

<style scoped>

</style>