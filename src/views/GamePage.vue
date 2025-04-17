<script setup>
import { ref, watch } from "vue";

import PlayGame from "./PlayGame.vue";

import { gameOver, initGame } from "./game";

watch(gameOver, () => {
  if (gameOver.value) {
    alert("Game Over!");
    initGame();
  }
});

initGame();
</script>
<template>
  <PlayGame></PlayGame>
</template>
