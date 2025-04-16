import { ref, computed, onMounted, onUnmounted } from "vue";
import { CELL_SIZE, mapData } from "./useMapEditor";

export const player = ref(null);
export const start = ref(false);

export const spawnPoint = computed(() => {
  const point = { x: 0, y: 0 };
  mapData.value.forEach((rows, x) =>
    rows.forEach((cell, y) => {
      if (cell === "spawn") [point.x, point.y] = [x * CELL_SIZE, y * CELL_SIZE];
    })
  );
  return point;
});

// player 工廠
export function manufacturePlayer() {
  player.value = {
    position: { ...spawnPoint.value },
    shape: { w: 50, h: 50 },
    speed: { x: 0, y: 0 },
  };
}

// 碰撞檢測
function intersect(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function isBlocked(shape) {
  let coll = false;

  // TODO: should find the destination blocks first
  mapData.value.forEach((rows, tx) => {
    rows.forEach((cell, ty) => {
      if (!cell) return;
      if (cell === "spawn") return;
      if (cell === "star") return;

      const collPos = {
        x: tx * CELL_SIZE,
        y: ty * CELL_SIZE,
        w: CELL_SIZE,
        h: CELL_SIZE,
      };

      if (intersect(shape, collPos)) {
        coll = true;
      }
    });
  });

  return coll;
}

// 限制數值範圍
function minMax(val, min, max) {
  return Math.max(Math.min(val, max), min);
}

function move() {
  const { x, y } = player.value.position;
  const { x: speedX, y: speedY } = player.value.speed;
  const { w, h } = player.value.shape;

  // 預計前往的 x
  const pendingX = player.value.position.x + speedX;
  if (!isBlocked({ x: pendingX, y, w, h })) {
    player.value.position.x += speedX;
  } else {
    player.value.speed.x = 0;
  }

  // 分開 xy verify
  const pendingY = player.value.position.y + speedY;
  if (!isBlocked({ x, y: pendingY, w, h })) {
    player.value.position.y += speedY;
  } else {
    player.value.speed.y = 0;
  }

  // gravity
  player.value.speed.y += 9.8 / 100;
  player.value.speed.y = minMax(player.value.speed.y, -10, 10);
}

// 左右移動的瞬間加速
const MOVING_RATE = 3;

// 跳躍的瞬間加速
const JUMPING_RATE = 3;

function moveLeft(e) {
  startGame();

  // x 方向不需要加速，只需要設置一個目標速度
  player.value.speed.x = -MOVING_RATE;
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  startGame();

  player.value.speed.x = MOVING_RATE;
}

// 每次 keydown 只觸發一次 jump
let jumped = false;
function jump(e) {
  startGame();

  if (!jumped) {
    player.value.speed.y += -JUMPING_RATE;

    // 速度太快會飛出去，限制 minmax
    player.value.speed.y = minMax(player.value.speed.y, -10, 10);

    jumped = true;
  }
}

function render() {
  move();

  if (start.value) {
    requestAnimationFrame(render);
  }
}

function startGame() {
  if (start.value) return;
  start.value = true;
  render();
}

// ---- events

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

export function initGame() {
  onMounted(() => {
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("keyup", keyup);
  });
}
