import { ref, computed } from "vue";
import { mapData as currentMapData } from "./useMapEditor";
import { CELL_SIZE } from "./config";

// 正在遊戲的 map，可以移除 star
export const mapData = ref(null);

export const player = ref(null);

export const collectedStars = ref(0);

export const lostLife = ref(false);

// 遊戲是否已開始
export const gameStarted = ref(false);

// 凍住 moving platform
export const freeze = ref(false);

export const isAccomplished = computed(() => {
  const stars = currentMapData.value.flat().filter((v) => v?.type === "star");
  return collectedStars.value === stars.length;
});

// reset all game status
export function initGame() {
  // 應為要移除星星，克隆一份
  mapData.value = JSON.parse(JSON.stringify(currentMapData.value));

  player.value = manufacturePlayer(mapData);

  collectedStars.value = 0;

  lostLife.value = false;

  gameStarted.value = false;

  freeze.value = true;
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
