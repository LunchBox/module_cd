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
    position: spawnPoint.value,
    shape: { w: 50, h: 50 },
    speed: { x: 0, y: 0 },
  };
}

function move() {
  const { x: speedX, y: speedY } = player.value.speed;

  // 預計前往的地方
  const pendingPos = player.value.position.x + speedX;

  // TODO: 判斷目標地點能否移動
  player.value.position.x += speedX;
  player.value.position.y += speedY;

  // gravity
  player.value.speed.y += 9.8 / 100;
}

const XG = 1;

function moveLeft(e) {
  startGame();

  // 速度
  player.value.speed.x += -XG;
  player.value.speed.x = Math.max(player.value.speed.x, -5); // limit
}

// TODO: 和上面重複了，可以優化
function moveRight(e) {
  startGame();

  // 速度
  player.value.speed.x += XG;
  player.value.speed.x = Math.min(player.value.speed.x, 5); // limit
}

function jump(e) {
  startGame();

  player.value.speed.y += -XG;
  player.value.speed.y = Math.min(player.value.speed.y, 5); // limit
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

export function initGame() {
  onMounted(() => {
    document.addEventListener("keydown", keydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", keydown);
  });
}
