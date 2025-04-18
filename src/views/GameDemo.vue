<script setup>
import { watch } from "vue";
import PlayableLevel from "@/components/PlayableLevel.vue";

import { currentLevel, levelAccomplished } from "@/stores/entireGame";

import { initGame, lostLife } from "@/stores/playingLevel";

// 一丟命就 reset game
watch(lostLife, () => {
  if (!lostLife.value) return;

  initGame();
});

initGame();
</script>
<template>
  <div>
    <div>
      <button @click="$router.push('/editor')">Return to Editor</button>
    </div>
    <h2>
      Demo - Level
      {{ currentLevel }}

      <span v-if="levelAccomplished"> !!! Accomplished !!!</span>
    </h2>
    <PlayableLevel></PlayableLevel>
  </div>
</template>
