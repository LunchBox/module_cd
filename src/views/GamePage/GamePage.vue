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

import { ranks } from "@/stores/ranks";

const currentRanks = ref([]);

const lifes = ref(DEFAULE_LIFES);

currentLevel.value = 0;

const modal = ref(null);

function restartLevel() {
  initGame();
  resetTimer();
  onResume();
}

watch(lostLife, () => {
  // 只看 lostLife.value = true
  // initGame 時會將 lostLife.value 轉回 false，這裡會也觸發一次，但 false 可以不用處理
  if (!lostLife.value) return;

  lifes.value -= 1;
  onPause();

  if (lifes.value <= 0) {
    modal.value = "gameOver";
  } else {
    restartLevel();
  }
});

const nickName = ref(null);

watch(isAccomplished, () => {
  // 只看 isAccomplished.value = true
  if (!isAccomplished.value) return;

  currentRanks.value.push({
    level: currentLevel.value,
    times: timer.value,
    lifes: lifes.value,
  });

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
  restartLevel();
}

function retry() {
  lifes.value = DEFAULE_LIFES;
  currentLevel.value = 0;
  modal.value = null;
  currentRanks.value = [];

  restartLevel();
}

function onPause() {
  stopTimer();
  pauseGame();
}

function onResume() {
  resumeGame();
  startTimer();
}

restartLevel();

const router = useRouter();
function toHome() {
  if (!confirm("Do you want to return?")) return;
  router.push("/");
}

function submitRanks() {
  currentRanks.value.forEach((obj) => {
    ranks.value.push({ ...obj, nickName });
    console.log(ranks.value);
    router.push("/ranks");
  });
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
      <form @submit.prevent="submitRanks">
        <div>
          You Did IT!!!<br />
          <input
            type="text"
            placeholder="Input Your Name"
            v-model="nickName"
            required
          />
          <button>Submit Ranking</button>
        </div>
      </form>
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
