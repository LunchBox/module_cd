<script setup>
import { ref, watch } from "vue";

import { LEVELS, DEFAULE_LIFES } from "@/libs/config";
import {
  initGame,
  isAccomplished,
  pauseGame,
  lostLife,
} from "@/libs/playingLevel";

import { currentLevel } from "@/libs/entireGame";

import PlayableLevel from "@/components/PlayableLevel.vue";

const lifes = ref(DEFAULE_LIFES);

currentLevel.value = 0;

const modal = ref(null);

watch(lostLife, () => {
  // 只看 lostLife.value = true
  // initGame 時會將 lostLife.value 轉回 false，這裡會也觸發一次，但 false 可以不用處理
  if (!lostLife.value) return;

  lifes.value -= 1;
  pauseGame();

  if (lifes.value <= 0) {
    modal.value = "gameOver";
  } else {
    initGame();
  }
});

watch(isAccomplished, () => {
  // 只看 isAccomplished.value = true
  if (!isAccomplished.value) return;

  pauseGame();

  if (currentLevel.value >= LEVELS - 1) {
    modal.value = "gameAccomplished";
  } else {
    modal.value = "nextLevel";
  }
});

function nextLevel() {
  modal.value = null;
  currentLevel.value += 1;
  initGame();
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
    <header>
      <h2>
        Game Page - Level
        {{ currentLevel }}
      </h2>
    </header>

    <div>
      Lives:
      <template v-if="lifes >= 0">
        <span v-for="i in lifes">❤️</span>
      </template>
    </div>

    <div class="game-wrapper">
      <PlayableLevel></PlayableLevel>

      <div>
        <button @click="$router.push('/')">Home</button>
        <button @click="pauseGame">Pause</button>
      </div>
    </div>

    <div class="modal" v-if="modal === 'gameOver'">
      <div>
        Game Over! <br />
        <button @click="retry">Retry?</button>
      </div>
    </div>

    <div class="modal" v-if="modal === 'nextLevel'">
      <div>
        Level {{ currentLevel }} Accomplished! <br />
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
