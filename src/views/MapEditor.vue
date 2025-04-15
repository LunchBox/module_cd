<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";

const currentLevel = ref(1);

const tools = Object.freeze({
  spawn: "Spawn Point",
  star: "Star",
  base: "Base Block",
  jump: "Jump Sprint",
  sloped: "Sloped Block",
  moving: "Moving Platform",
  remove: "Remove Tool",
});

const selectedTool = ref(null);

const mapSize = ref({ w: 10, h: 10 });

function initMapData() {
  const { w, h } = mapSize.value;
  return [...Array(h)].map(() => Array(w));
}

const mapData = ref(initMapData());

function blockClass(x, y) {
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

function mouseDownOnBlock(x, y) {
  startPoint.value = { x, y };
  dragging.value = true;
}

function mouseoverOnBlock(x, y) {
  currentPoint.value = { x, y };
}

// 在 block 上 mouse up，通常用來 place blocks
function mouseUpOnBlock(x, y) {
  const { x: sx, y: sy } = startPoint.value;
  const { x: cx, y: cy } = currentPoint.value;

  const sameBlock = sx === cx && sy === cy;

  switch (selectedTool.value) {
    case "Remove Tool":
      if (sameBlock) mapData.value[cx][cy] = null;
      break;

    default:
      if (sameBlock) {
        // 在同一格 mouse down & up，就放置對應的 block
        if (available(cx, cy)) {
          mapData.value[cx][cy] = selectedTool.value;

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
</script>
<template>
  <div class="map-editor">
    <header>
      <h2>
        Map Editor - Level
        {{ currentLevel }}
      </h2>

      <div class="level-selector">
        <button
          v-for="i in 3"
          :key="i"
          :class="{ active: currentLevel === i }"
          @click="currentLevel = i"
        >
          Level {{ i }}
        </button>
      </div>
    </header>
    <main>
      <div class="toolbox">
        <button v-for="(v, k) in tools" :key="k" @click="selectedTool = k">
          {{ v }}
        </button>
      </div>

      <div class="game" @contextmenu.prevent>
        <div v-for="(_, y) in mapSize.h" :id="y" class="row">
          <div
            v-for="(_, x) in mapSize.w"
            class="block"
            :key="x"
            :class="blockClass(x, y)"
            @dragstart.prevent
            @mousedown.left="mouseDownOnBlock(x, y)"
            @mouseover="mouseoverOnBlock(x, y)"
            @mouseup.left="mouseUpOnBlock(x, y)"
          ></div>
        </div>
      </div>
    </main>
    <footer>
      <button>Play Demo</button>
      {{ selectedTool }}
      {{ startPoint }}
      {{ currentPoint }}
      {{ dragging }}
      {{ draggingPath }}
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.game {
  margin: 1rem 0;

  .row {
    display: flex;

    .block {
      width: 50px;
      height: 50px;
      border: 1px solid #ccc;
      position: relative;

      &.base,
      &.base-preview {
        background: #333;
      }
      &.base-preview {
        opacity: 0.5;

        &.taken {
          background: tomato;
        }
      }

      &.star::after,
      &.star-preview::after {
        content: "⭐";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
      }
      &.star-preview {
        opacity: 0.5;
      }

      &.sloped,
      &.sloped-preview {
        border-color: transparent #333 #333 transparent;
        border-style: solid;
        border-width: 25px;
        width: 0;
        height: 0;
      }
      &.sloped-preview {
        opacity: 0.5;

        &.taken {
          border-color: transparent tomato tomato transparent;
        }
      }

      /* 水平移動平台 */
      &.moving::after,
      &.moving-preview::after {
        content: "〰️";
        position: absolute;
        width: 150px;
        margin-left: -50px;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
        background: #ccc;
      }
      &.moving-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }

      /* 垂直移動平台 */
      &.moving-y::after,
      &.moving-y-preview::after {
        content: "〰️";
        position: absolute;
        width: 100%;
        height: 150px;
        margin-top: -50px;
        display: grid;
        place-content: center;
        font-size: 2rem;
        background: #ccc;
      }
      &.moving-y-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }
    }
  }
}
</style>
