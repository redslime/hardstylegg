<script setup lang="ts">
import {resolve} from "pathe";

const path = resolve('../public/artwork')
const path1 = resolve('public/artwork')
</script>

<template>
  {{ path }}
  <br>
  {{ path1 }}
  <br>
  {{ resolve('../public/artwork') }}
</template>

<style scoped>

</style>