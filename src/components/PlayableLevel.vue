<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import MapGrid from "@/components/MapGrid.vue";

import useEventListener from "@/utils/useEventListener";

import {
  mapData,
  player,
  collectedStars,
  isAccomplished,
  freeze,
  keyup,
  keydown,
  isPaused,
  resumeGame,
  toggleGame,
} from "@/stores/playingLevel";

onMounted(resumeGame);

// 記得在離開時暫停 game，但取消 freeze，否則 map 預覽頁面的 moving platform 不會動
onUnmounted(() => {
  isPaused.value = true;
  freeze.value = false;
});

// onMounted 和 onUnmounted 要放在 vue file 里
useEventListener(document, "keyup", keyup);
useEventListener(document, "keydown", keydown);

// 空格暫停和繼續遊戲
useEventListener(document, "keydown", (e) => {
  if (e.code === "Space") toggleGame();
});

const playerStyle = computed(() => {
  if (!player.value) return {};
  const p = player.value;
  return {
    left: p.x + "px",
    top: p.y + "px",
    width: p.w + "px",
    height: p.h + "px",
  };
});
</script>

<template>
  <div>
    <div class="game">
      <MapGrid :mapData="mapData"></MapGrid>
      <div v-if="player" class="player" :style="playerStyle"></div>
    </div>
    Collected Stars: {{ collectedStars }} <br />
    {{ isAccomplished }}
    {{ player }} <br />
    {{ playerStyle }} <br />
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
