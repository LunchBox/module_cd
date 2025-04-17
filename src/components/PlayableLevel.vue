<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import MapGrid from "@/components/MapGrid.vue";

import { CELL_SIZE, MAP_COLS, MAP_ROWS } from "@/libs/config";
import {
  currentLevel,
  mapData as originalMapData,
  accomplishedLevels,
  levelAccomplished,
} from "@/libs/entireGame";

import useEventListener from "@/utils/useEventListener";

import intersect from "@/utils/useIntersect";

import minMax from "@/utils/useMinMax";

import {
  mapData,
  player,
  collectedStars,
  isAccomplished,
  lostLife,
  gameStarted,
  freeze,
} from "@/libs/playingLevel";

// 左右移動的瞬間加速
const MOVING_RATE = 3;

// 跳躍的瞬間加速
const DEFAULT_JUMP_RATE = 8;
const jumpRate = ref(DEFAULT_JUMP_RATE);

// 檢查邊界，如果 player 碰到邊界視為 lost life
function checkBorders() {
  if (!player.value) return;
  const { x, y, w, h } = player.value;

  if (
    x < 0 ||
    x + w > MAP_COLS * CELL_SIZE ||
    y < 0 ||
    y + h > MAP_ROWS * CELL_SIZE
  ) {
    lostLife.value = true;
  }
}

watch(player, checkBorders, { deep: true });

// -------------------------------------------------

// 取出 grid 裡所有的 rect
const allRects = computed(() => {
  const rects = [];

  mapData.value.forEach((rows, tx) => {
    rows.forEach((cell, ty) => {
      if (!cell) return;
      if (cell?.type === "spawn") return;

      // 移動平台的前後上下不用檢查是否碰撞
      if (cell?.type === "placeholder") return;

      const rect = {
        type: cell.type,
        gx: tx,
        gy: ty,
        x: tx * CELL_SIZE,
        y: ty * CELL_SIZE,
        w: CELL_SIZE,
        h: CELL_SIZE,
      };

      if (cell?.type === "moving") {
        rect.x += cell.offset;
      }

      if (cell?.type === "moving-y") {
        rect.y += cell.offset;
      }

      rects.push(rect);
    });
  });

  return rects;
});

function interactWithStar(rect) {
  const { gx, gy } = rect;
  mapData.value[gx][gy] = null;

  collectedStars.value += 1;

  if (isAccomplished.value) {
    accomplishedLevels.value.add(currentLevel.value);
  }
}

function interactWithJump(rect) {
  const { x, y, w, h } = player.value;

  // 站在 jump 上面
  if (y + h > rect.y - 1) {
    jumpRate.value = DEFAULT_JUMP_RATE * 2;
  }
}

function interactWithPlatform(rect) {
  const { x, y, w, h } = player.value;

  // 碰到尖刺(player 的 rect 低於 moving block 的頂端就視為碰到尖刺)
  if (y + h > rect.y + 2) {
    // +2 避免一碰到就判定為碰到尖刺
    lostLife.value = true;
  } else {
    // move the player
    // 暫時只做到抬高 player
    if (rect.type === "moving-y") {
      player.value.y = rect.y - h;
    }
  }
}

function checkBlocked(shape) {
  let coll = false;

  // TODO: should find the destination blocks first
  allRects.value.forEach((rect) => {
    if (intersect(shape, rect)) {
      switch (rect.type) {
        case "moving":
        case "moving-y":
          interactWithPlatform(rect);
          coll = true;
          break;
        case "jump":
          interactWithJump(rect);
          coll = true;
          break;
        case "star":
          interactWithStar(rect);
          // 這裡不設置 col = true
          // star 可以被拾取后穿過
          break;
        default:
          jumpRate.value = DEFAULT_JUMP_RATE;
          coll = true;
      }
    }
  });

  return coll;
}

function renderFrame() {
  const { x, y, w, h, speedX, speedY } = player.value;

  // 預計前往的 x
  const pendingX = player.value.x + speedX;
  if (!checkBlocked({ x: pendingX, y, w, h })) {
    player.value.x += speedX;
  } else {
    player.value.speedX = 0;
  }

  // 分開 xy 檢查是否能夠移動
  const pendingY = player.value.y + speedY;
  if (!checkBlocked({ x, y: pendingY, w, h })) {
    player.value.y += speedY;
  } else {
    player.value.speedY = 0;
  }

  // gravity
  player.value.speedY += 9.8 / 20;
  player.value.speedY = minMax(player.value.speedY, -10, 10);
}

function moveLeft(e) {
  resumeGame();

  // x 方向不需要加速，只需要設置一個目標速度
  player.value.speedX = -MOVING_RATE;
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  resumeGame();

  player.value.speedX = MOVING_RATE;
}

// 每次 keydown 只觸發一次 jump
let jumped = false;
function jump(e) {
  resumeGame();

  if (!jumped) {
    player.value.speedY += -jumpRate.value;

    // 速度太快會飛出去，限制 minmax
    player.value.speedY = minMax(player.value.speedY, -10, 10);

    jumped = true;
  }
}

// 放開按下的按鍵就重設 jumped
useEventListener(document, "keyup", (e) => {
  jumped = false;
});

// 監聽其他方向鍵
useEventListener(document, "keydown", (e) => {
  switch (e.key) {
    case "a":
      moveLeft();
      break;
    case "d":
      moveRight();
      break;
    case "w":
      jump();
      break;
  }
});

function render() {
  renderFrame();
  if (gameStarted.value) {
    requestAnimationFrame(render);
  }
}

// 繼續遊戲
function resumeGame() {
  if (gameStarted.value) return;
  gameStarted.value = true;
  freeze.value = false;
  render();
}

// 暫停遊戲
function pauseGame() {
  gameStarted.value = false;
  freeze.value = true;
}

onMounted(resumeGame);

// 記得在離開時暫停 game
onUnmounted(() => {
  gameStarted.value = false;
  freeze.value = false;
});

// 空格暫停和繼續遊戲
useEventListener(document, "keydown", (e) => {
  if (e.code === "Space") {
    if (gameStarted.value) {
      pauseGame();
    } else {
      resumeGame();
    }
  }
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
    Ac Levels: {{ [...accomplishedLevels] }} <br />
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
