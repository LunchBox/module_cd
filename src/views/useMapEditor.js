import { onMounted, onUnmounted, ref, computed } from "vue";

export const LEVELS = 3;

export const selectedTool = ref(null);

export const mapSize = ref({ w: 10, h: 10 });

function initMapData() {
  const { w, h } = mapSize.value;
  return [...Array(h)].map(() => Array(w));
}

export const gameData = ref([...Array(LEVELS)].map(() => initMapData()));

export const mapData = ref(gameData.value[0]);

export const currentLevel = ref(0);

export function toLevel(lv) {
  currentLevel.value = lv;
  mapData.value = gameData.value[lv];
}

export function blockClass(x, y) {
  const cs = [];

  // 如果已放置 block
  cs.push({ [mapData.value[x][y]]: !!mapData.value[x][y] });

  // 如果選中了某個 tool 準備放置
  if (selectedTool.value && currentPoint.value) {
    const { x: cx, y: cy } = currentPoint.value;

    if (dragging.value && draggingPath.value) {
      // 如果當前 block 在 draggingPath 中，顯示 preview
      if (draggingPath.value.some(({ x: dx, y: dy }) => dx === x && dy === y)) {
        cs.push(`base-preview`);
      }
    } else if (x == cx && y == cy) {
      // 鼠標 hover 時顯示 preview
      if (selectedTool.value && selectedTool.value !== "remove") {
        cs.push(`${selectedTool.value}-preview`);
      }
    }
  }

  // 如果已被佔用
  // 可以優化
  if (!available(x, y)) cs.push("taken");

  return cs;
}

// 鼠標點下去的起始 block position
const startPoint = ref(null);

// 鼠標移動的當前 block position
const currentPoint = ref(null);

// 是否在 dragging （左鍵按下不放）
const dragging = ref(false);

// 正在拖拽中的 blocks
const draggingPath = computed(() => {
  if (!dragging.value) return [];

  if (selectedTool.value === "base") {
    const { x: sx, y: sy } = startPoint.value;
    const { x: cx, y: cy } = currentPoint.value;

    // 必須是同一行或者同一列
    if (sx !== cx && sy !== cy) return [];

    const xDiff = sx > cx ? -1 : 1;
    const xs = [...Array(Math.abs(sx - cx) + 1)].map((_, i) => sx + i * xDiff);

    const yDiff = sy > cy ? -1 : 1;
    const ys = [...Array(Math.abs(sy - cy) + 1)].map((_, i) => sy + i * yDiff);

    return xs
      .map((x) =>
        ys.map((y) => {
          return { x, y };
        })
      )
      .flat();
  }

  return [];
});

// cell 是否能夠放置當前的 tool
function available(x, y) {
  if (mapData.value[x][y]) return false;

  // 右側是斜坡不能放除了星星之外的東西
  if (mapData.value[x + 1]?.[y] === "sloped" && selectedTool.value !== "star") {
    return false;
  }

  // 左側不是星星不能放斜坡
  if (
    mapData.value[x - 1]?.[y] &&
    mapData.value[x - 1]?.[y] !== "star" &&
    selectedTool.value === "sloped"
  ) {
    return false;
  }

  //左右邊界不能放 moving
  if (selectedTool.value === "moving" && (x <= 0 || x >= mapSize.value.w - 1)) {
    return false;
  }

  // 左側或者右側有東西不能放 moving
  if (
    selectedTool.value === "moving" &&
    (mapData.value[x - 1]?.[y] || mapData.value[x + 1]?.[y])
  ) {
    return false;
  }

  // 上下邊界不能放 moving-y
  if (
    selectedTool.value === "moving-y" &&
    (y <= 0 || y >= mapSize.value.h - 1)
  ) {
    return false;
  }

  // 上下有東西不能放 moving-y
  if (
    selectedTool.value === "moving-y" &&
    (mapData.value[x]?.[y - 1] || mapData.value[x]?.[y + 1])
  ) {
    return false;
  }

  return true;
}

export function mouseDownOnBlock(x, y) {
  startPoint.value = { x, y };
  dragging.value = true;
}

export function mouseOverOnBlock(x, y) {
  currentPoint.value = { x, y };
}

// 在 block 上 mouse up，通常用來 place blocks
export function mouseUpOnBlock(x, y) {
  const { x: sx, y: sy } = startPoint.value;
  const { x: cx, y: cy } = currentPoint.value;

  const sameBlock = sx === cx && sy === cy;

  switch (selectedTool.value) {
    case "remove":
      if (!sameBlock) break;

      if (selectedTool.value === "sloped") {
        mapData.value[cx - 1][cy] = null;
      }

      if (mapData.value[cx][cy] === "moving") {
        mapData.value[cx - 1][cy] = null;
        mapData.value[cx + 1][cy] = null;
      }

      if (mapData.value[cx][cy] === "moving-y") {
        mapData.value[cx][cy - 1] = null;
        mapData.value[cx][cy + 1] = null;
      }

      mapData.value[cx][cy] = null;

      break;

    default:
      if (sameBlock) {
        // 在同一格 mouse down & up，就放置對應的 block
        if (available(cx, cy)) {
          mapData.value[cx][cy] = selectedTool.value;

          if (selectedTool.value === "sloped") {
            mapData.value[cx - 1][cy] = "sloped-left";
          }

          // 標記 moving platform
          if (selectedTool.value === "moving") {
            mapData.value[cx - 1][cy] = "moving-left";
            mapData.value[cx + 1][cy] = "moving-right";
          }

          if (selectedTool.value === "moving-y") {
            mapData.value[cx][cy - 1] = "moving-top";
            mapData.value[cx][cy + 1] = "moving-down";
          }
        }
      } else if (dragging.value && selectedTool.value === "base") {
        // 是在 dragging
        draggingPath.value.forEach(({ x: px, y: py }) => {
          if (available(px, py)) mapData.value[px][py] = selectedTool.value;
        });
      }

      break;
  }
}

function mouseMove(e) {}

function mouseDownOnScreen(e) {}

function mouseUpOnScreen(e) {
  startPoint.value = null;
  dragging.value = false;

  // 取消 tool
  if (e.button === 2) {
    selectedTool.value = null;
  }
}

// 按 R 旋轉 moving platform
function keyDown(e) {
  const tool = selectedTool.value;
  if (e.key === "r" && (tool === "moving" || tool === "moving-y")) {
    selectedTool.value = tool === "moving" ? "moving-y" : "moving";
  }
}

export function initMapTools() {
  onMounted(() => {
    document.addEventListener("mousedown", mouseDownOnScreen);
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUpOnScreen);

    document.addEventListener("keydown", keyDown);
  });

  onUnmounted(() => {
    document.removeEventListener("mousedown", mouseDownOnScreen);
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUpOnScreen);

    document.removeEventListener("keydown", keyDown);
  });
}
