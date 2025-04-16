<script setup>
import { ref, computed, onMounted } from "vue";
import MapGrid from "./MapGrid.vue";

import { CELL_SIZE } from "./config";
import {
  currentLevel,
  mapData as originalMapData,
  accomplishedLevels,
  levelAccomplished,
} from "./useMapEditor";

import { intersect, minMax } from "./utils";
import useEventListener from "./useEventListener";

// 左右移動的瞬間加速
const MOVING_RATE = 3;

// 跳躍的瞬間加速
const JUMPING_RATE = 8;

// 應為要移除星星，克隆一份
const mapData = ref(JSON.parse(JSON.stringify(originalMapData.value)));

const collectedStars = ref(0);
const start = ref(false);

// 出生點
const spawnPoint = computed(() => {
  const point = { x: 0, y: 0 };

  mapData.value.forEach((rows, x) =>
    rows.forEach((cell, y) => {
      if (cell?.type === "spawn") {
        [point.x, point.y] = [x * CELL_SIZE, y * CELL_SIZE];
      }
    })
  );

  return point;
});

const isAccomplished = computed(() => {
  const stars = originalMapData.value.flat().filter((v) => v?.type === "star");
  return collectedStars.value === stars.length;
});

const player = ref(manufacturePlayer(mapData));

function collectStar() {
  collectedStars.value += 1;

  if (isAccomplished.value) {
    accomplishedLevels.value.add(currentLevel.value);
  }
}

function checkBlocked(shape) {
  let coll = false;

  // TODO: should find the destination blocks first
  mapData.value.forEach((rows, tx) => {
    rows.forEach((cell, ty) => {
      if (!cell) return;
      if (cell?.type === "spawn") return;

      const collPos = {
        x: tx * CELL_SIZE,
        y: ty * CELL_SIZE,
        w: CELL_SIZE,
        h: CELL_SIZE,
      };

      if (intersect(shape, collPos)) {
        if (cell?.type === "star") {
          collectStar();
          mapData.value[tx][ty] = null;
        } else {
          coll = true;
        }
      }
    });
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

  // 分開 xy verifya
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
  start.value = true;

  // x 方向不需要加速，只需要設置一個目標速度
  player.value.speed.x = -MOVING_RATE;
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  start.value = true;

  player.value.speed.x = MOVING_RATE;
}

// 每次 keydown 只觸發一次 jump
let jumped = false;
function jump(e) {
  start.value = true;

  if (!jumped) {
    player.value.speed.y += -JUMPING_RATE;

    // 速度太快會飛出去，限制 minmax
    player.value.speed.y = minMax(player.value.speed.y, -10, 10);

    jumped = true;
  }
}

function keydown(e) {
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
}

function keyup(e) {
  jumped = false;
}

useEventListener(document, "keydown", keydown);
useEventListener(document, "keyup", keyup);

function render() {
  move();
  requestAnimationFrame(render);
}

onMounted(() => {
  render();
});

// player 工廠
function manufacturePlayer() {
  return {
    position: { ...spawnPoint.value },
    shape: { w: 50, h: 50 },
    speed: { x: 0, y: 0 },
  };
}

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
