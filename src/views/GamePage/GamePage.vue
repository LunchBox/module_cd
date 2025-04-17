<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

import { LEVELS, DEFAULE_LIFES } from "@/stores/config";
import {
  initGame,
  isAccomplished,
  pauseGame,
  resumeGame,
  lostLife,
} from "@/stores/playingLevel";

import { currentLevel } from "@/stores/entireGame";

import PlayableLevel from "@/components/PlayableLevel.vue";

import {
  timer,
  formattedTime,
  startTimer,
  stopTimer,
  resetTimer,
} from "./timer";

const lifes = ref(DEFAULE_LIFES);

currentLevel.value = 0;

const modal = ref(null);

watch(lostLife, () => {
  // 只看 lostLife.value = true
  // initGame 時會將 lostLife.value 轉回 false，這裡會也觸發一次，但 false 可以不用處理
  if (!lostLife.value) return;

  lifes.value -= 1;
  onPause();

  if (lifes.value <= 0) {
    modal.value = "gameOver";
  } else {
    initGame();
    onResume();
  }
});

watch(isAccomplished, () => {
  // 只看 isAccomplished.value = true
  if (!isAccomplished.value) return;

  onPause();

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
  onResume();
}

function retry() {
  lifes.value = DEFAULE_LIFES;
  currentLevel.value = 0;
  modal.value = null;

  initGame();
  resetTimer();
  onResume();
}

function onPause() {
  stopTimer();
  pauseGame();
}

function onResume() {
  resumeGame();
  startTimer();
}

initGame();
resetTimer();
startTimer();

const router = useRouter();
function toHome() {
  if (!confirm("Do you want to return?")) return;
  router.push("/");
}
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

      {{ formattedTime }}
    </div>

    <div class="game-wrapper">
      <PlayableLevel></PlayableLevel>

      <div>
        <button @click="toHome">Home</button>
        <button @click="onPause">Pause</button>
        <button @click="onResume">Resume</button>
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
