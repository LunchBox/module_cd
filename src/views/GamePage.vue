<script setup>
import { ref, watch } from "vue";

import { LEVELS, DEFAULE_LIFES } from "./config";
import { lostLife, initGame, isAccomplished } from "./game";
import { currentLevel } from "./useMapEditor";

import PlayGame from "./PlayGame.vue";

currentLevel.value = 0;

const lifes = ref(DEFAULE_LIFES);

const modal = ref(null);

watch(lostLife, () => {
  if (lostLife.value) {
    lifes.value -= 1;
    if (lifes.value <= 0) {
      modal.value = "gameOver";
    }

    initGame();
  }
});

watch(isAccomplished, () => {
  if (currentLevel.value >= LEVELS) {
    modal.value = "gameAccomplished";
  } else {
    modal.value = "nextLevel";
  }
});

function nextLevel() {
  currentLevel.value += 1;
  initGame();
  modal.value = null;
}

function retry() {
  lifes.value = DEFAULE_LIFES;
  currentLevel.value = 0;
  modal.value = null;
  initGame();
}

initGame();
</script>
<template>
  <div>
    <div>
      Lives:
      <span v-for="i in lifes">❤️</span>
    </div>
    <div class="game-wrapper">
      <PlayGame></PlayGame>

      <div class="modal" v-if="modal === 'gameOver'">
        <div>
          Game Over! <br />
          <button @click="retry">Retry?</button>
        </div>
      </div>

      <div class="modal" v-if="modal === 'nextLevel'">
        <div>
          Mission Accomplished! <br />
          <button @click="nextLevel">Next Level</button>
        </div>
      </div>

      <div class="modal" v-if="modal === 'gameAccomplished'">
        <div>
          You Did IT!!!<br />
          <input type="text" placeholder="Input Your Name" />
          <button @click="retry">Submit Ranking</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
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

.game-wrapper {
  position: relative;
}
</style>
