<script setup>
import { watch } from "vue";
import PlayableLevel from "@/components/PlayableLevel.vue";

import { currentLevel, levelAccomplished } from "@/libs/entireGame";

import { lostLife, initGame } from "@/libs/playingLevel";

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
