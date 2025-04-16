<script setup>
import { computed } from "vue";
import MapGrid from "./MapGrid.vue";
import { currentLevel } from "./useMapEditor";

import { player, initGame } from "./useGameDemo";

initGame();

const playerStyle = computed(() => {
  const p = player.value;
  return {
    left: p.position.x + "px",
    top: p.position.y + "px",
    width: p.shape.w + "px",
    height: p.shape.h + "px",
  };
});
</script>

<template>
  <div>
    <div>
      <button @click="$router.push('/editor')">Returnto Editor</button>
    </div>

    <div>
      <header>
        <h2>
          Map Editor - Level
          {{ currentLevel }}
        </h2>
      </header>
      <div class="game">
        <MapGrid></MapGrid>
        <div class="player" :style="playerStyle"></div>
      </div>
      {{ player }}
      {{ playerStyle }}
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.game {
  position: relative;
}

.player {
  position: absolute;
  border: 1px solid blue;

  &::after {
    content: "🏃🏻‍♂️";
    position: absolute;
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
    font-size: 2rem;
  }
}
</style>
