<script setup>
import { watch } from "vue";
import PlayGame from "./PlayGame.vue";

import { lostLife, initGame } from "./game";

watch(lostLife, () => {
  if (lostLife.value) {
    initGame();
  }
});

initGame();
</script>
<template>
  <PlayGame></PlayGame>
</template>
