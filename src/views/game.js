import { ref, computed, onMounted, watch } from "vue";
import { mapData as originalMapData } from "./useMapEditor";
import { CELL_SIZE } from "./config";

export const mapData = ref(null);
export const player = ref(null);

export const collectedStars = ref(0);

export const gameOver = ref(false);

export function initGame() {
  // 應為要移除星星，克隆一份
  mapData.value = JSON.parse(JSON.stringify(originalMapData.value));

  player.value = manufacturePlayer(mapData);

  gameOver.value = false;
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
    position: { ...spawnPoint.value },
    shape: { w: 50, h: 50 },
    speed: { x: 0, y: 0 },
  };
}
