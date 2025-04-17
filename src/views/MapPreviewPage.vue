<script setup>
import { LEVELS } from "./config";
import { gameData } from "./entireGame";
import MapGrid from "./MapGrid.vue";

function startGame(lv) {}
</script>
<template>
  <div>
    <header>
      <h2>关卡预览区（Level Preview Area）</h2>
    </header>
    <div class="game-preview">
      <MapGrid v-for="(_, lv) in LEVELS" :mapData="gameData[lv]"></MapGrid>
    </div>
    <button @click="startGame(lv)">Start Game</button>
    <button @click="$router.push('/ranks')">Rank</button>
    <button @click="$router.push('/editor')">Edit</button>
    <button @click="$router.push('/')">Home</button>
  </div>
</template>

<style scoped>
.game-preview {
  display: flex;
  gap: 1rem;
  scale: 0.5;
  transform-origin: 0 0;
}
</style>
