<script setup>
import { ref, watch } from "vue";

import PlayGame from "./PlayGame.vue";

import { lostLife, initGame } from "./game";

watch(lostLife, () => {
  if (lostLife.value) {
    alert("Game Over!");
    initGame();
  }
});

initGame();
</script>
<template>
  <PlayGame></PlayGame>
</template>
