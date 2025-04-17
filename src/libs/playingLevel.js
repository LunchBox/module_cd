import { ref, computed, watch } from "vue";

import {
  CELL_SIZE,
  MAP_COLS,
  MAP_ROWS,
  MOVING_RATE,
  DEFAULT_JUMP_RATE,
} from "@/libs/config";

import {
  mapData as currentMapData,
  currentLevel,
  accomplishedLevels,
} from "@/libs/entireGame";

import intersect from "@/utils/useIntersect";
import minMax from "@/utils/useMinMax";

// 正在 play 中的 map，export 出去用於顯示
// 這裡放的是 clone 過的 currentMapData, 避免直接修改地圖數據
export const mapData = ref(null);

export const player = ref(null);

export const collectedStars = ref(0);

// 是否暫停
export const isPaused = ref(false);

// 用於外界監聽 life change
export const lostLife = ref(false);

// 凍住 moving platform
export const freeze = ref(false);

export const isAccomplished = computed(() => {
  const stars = currentMapData.value.flat().filter((v) => v?.type === "star");
  return collectedStars.value === stars.length;
});

// reset all game status
export function initGame() {
  // 要能移除星星，克隆一份
  mapData.value = JSON.parse(JSON.stringify(currentMapData.value));

  player.value = manufacturePlayer(mapData);

  collectedStars.value = 0;

  lostLife.value = false;

  freeze.value = false;

  isPaused.value = false;
}

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

// player 工廠
function manufacturePlayer() {
  return {
    ...spawnPoint.value,
    w: 50,
    h: 50,
    speedX: 0,
    speedY: 0,
  };
}

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

// 地圖里所有可以碰撞的方塊
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
    jumpRate = DEFAULT_JUMP_RATE * 2;
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
          jumpRate = DEFAULT_JUMP_RATE;
          coll = true;
      }
    }
  });

  return coll;
}

function renderFrame() {
  if (!player.value) return;

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
  // x 方向不需要加速，只需要設置一個目標速度
  player.value.speedX = -MOVING_RATE;
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  player.value.speedX = MOVING_RATE;
}

// 每次 keydown 只觸發一次 jump
let jumped = false;
let jumpRate = DEFAULT_JUMP_RATE;
function jump(e) {
  if (!jumped) {
    player.value.speedY += -jumpRate;

    // 速度太快會飛出去，限制 minmax
    player.value.speedY = minMax(player.value.speedY, -10, 10);

    jumped = true;
  }
}

// 放開按下的按鍵就重設 jumped
export function keyup(e) {
  jumped = false;
}

// 監聽其他方向鍵
export function keydown(e) {
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

// 繼續遊戲
export function resumeGame() {
  isPaused.value = false;
  freeze.value = false;
}

// 暫停遊戲
export function pauseGame() {
  isPaused.value = true;
  freeze.value = true;
}

export function toggleGame(e) {
  if (isPaused.value) {
    resumeGame();
  } else {
    pauseGame();
  }
}

// 整個 app 共用一個 render 、requestAnimationFrame
function render() {
  if (!isPaused.value) {
    renderFrame();
  }

  requestAnimationFrame(render);
}
render();
