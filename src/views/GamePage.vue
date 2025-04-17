<script setup>
import { ref, watch } from "vue";

import PlayGame from "./PlayGame.vue";

import { lostLife, initGame } from "./game";

const DEFAULE_LIFES = 3;
const lifes = ref(DEFAULE_LIFES);

const gameOver = ref(false);

watch(lostLife, () => {
  if (lostLife.value) {
    lifes.value -= 1;
    if (lifes.value <= 0) {
      gameOver.value = true;
    }

    initGame();
  }
});

initGame();

function retry() {
  gameOver.value = false;
  lifes.value = DEFAULE_LIFES;
  initGame();
}
</script>
<template>
  <div>
    <div>
      Lives:
      <span v-for="i in lifes">❤️</span>
    </div>
    <div class="game-wrapper">
      <PlayGame></PlayGame>
      <div class="game-over" v-if="gameOver">
        <div>
          Game Over! <br />
          <button @click="retry">Retry?</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-wrapper {
  position: relative;

  .game-over {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);

    display: grid;
    place-items: center;
    text-align: center;
    font-size: 3rem;
    color: #fff;
  }
}
</style>
