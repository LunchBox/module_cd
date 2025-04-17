<script setup>
import { watch } from "vue";
import PlayGame from "./PlayGame.vue";

import { currentLevel, levelAccomplished } from "./entireGame";

import { lostLife, initGame } from "./game";

watch(lostLife, () => {
  if (lostLife.value) {
    initGame();
  }
});

initGame();
</script>
<template>
  <div>
    <div>
      <button @click="$router.push('/editor')">Returnto Editor</button>
    </div>
    <h2>
      Demo - Level
      {{ currentLevel }}

      <span v-if="levelAccomplished"> !!! Accomplished !!!</span>
    </h2>
    <PlayGame></PlayGame>
  </div>
</template>
