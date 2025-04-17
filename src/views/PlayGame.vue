<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  onUnmounted,
} from "vue";
import MapGrid from "./MapGrid.vue";

import { CELL_SIZE } from "./config";
import {
  currentLevel,
  mapData as originalMapData,
  accomplishedLevels,
  levelAccomplished,
  mapSize,
} from "./useMapEditor";

import { intersect, minMax } from "./utils";
import useEventListener from "./useEventListener";

import {
  mapData,
  player,
  collectedStars,
  gameOver,
  gameStarted,
  freeze,
} from "./game";

const emit = defineEmits(["lost-life"]);

// 左右移動的瞬間加速
const MOVING_RATE = 3;

// 跳躍的瞬間加速
const JUMPING_RATE = 8;

function checkGameOver() {
  const { x, y } = player.value.position;
  const { w, h } = player.value.shape;
  const { w: mw, h: mh } = mapSize.value;

  if (x < 0 || x + w > mw * CELL_SIZE || y < 0 || y + h > mh * CELL_SIZE) {
    gameOver.value = true;
  }
}

watch(
  player,
  () => {
    if (!player.value) return;
    checkGameOver();
  },
  { deep: true }
);

// -------------------------------------------------

const isAccomplished = computed(() => {
  const stars = originalMapData.value.flat().filter((v) => v?.type === "star");
  return collectedStars.value === stars.length;
});

function collectStar(tx, ty) {
  collectedStars.value += 1;
  mapData.value[tx][ty] = null;

  if (isAccomplished.value) {
    accomplishedLevels.value.add(currentLevel.value);
  }
}

// 取出 grid 裡所有的 block
const allRects = computed(() => {
  const rects = [];

  mapData.value.forEach((rows, tx) => {
    rows.forEach((cell, ty) => {
      if (!cell) return;
      if (cell?.type === "spawn") return;

      // 移動平台的前後上下不用檢查是否碰撞
      if (cell?.type?.startsWith("moving-")) return;

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

      rects.push(rect);
    });
  });

  return rects;
});

function interactWithPlatform(rect) {
  const { x, y } = player.value.position;
  const { w, h } = player.value.shape;

  // 碰到尖刺(player 的 rect 低於 moving block 的頂端就視為碰到尖刺)
  if (y + h > rect.y) {
    gameOver.value = true;
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
        case "star":
          collectStar(rect.gx, rect.gy);
          break;
        default:
          coll = true;
      }
    }
  });

  return coll;
}

function move() {
  const { position, speed, shape } = player.value;
  const { x, y } = position;
  const { x: speedX, y: speedY } = speed;
  const { w, h } = shape;

  // 預計前往的 x
  const pendingX = player.value.position.x + speedX;
  if (!checkBlocked({ x: pendingX, y, w, h })) {
    player.value.position.x += speedX;
  } else {
    player.value.speed.x = 0;
  }

  // 分開 xy 檢查是否能夠移動
  const pendingY = player.value.position.y + speedY;
  if (!checkBlocked({ x, y: pendingY, w, h })) {
    player.value.position.y += speedY;
  } else {
    player.value.speed.y = 0;
  }

  // gravity
  player.value.speed.y += 9.8 / 20;
  player.value.speed.y = minMax(player.value.speed.y, -10, 10);
}

function moveLeft(e) {
  resumeGame();

  // x 方向不需要加速，只需要設置一個目標速度
  player.value.speed.x = -MOVING_RATE;
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  resumeGame();

  player.value.speed.x = MOVING_RATE;
}

// 每次 keydown 只觸發一次 jump
let jumped = false;
function jump(e) {
  resumeGame();

  if (!jumped) {
    player.value.speed.y += -JUMPING_RATE;

    // 速度太快會飛出去，限制 minmax
    player.value.speed.y = minMax(player.value.speed.y, -10, 10);

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
  move();
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
    left: p.position.x + "px",
    top: `${p.position.y}px`,
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

          <span v-if="levelAccomplished"> !!! Accomplished !!!</span>
        </h2>
      </header>
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
