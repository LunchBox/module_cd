<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";

const currentLevel = ref(1);

const tools = [
  "Spawn Point",
  "Star",
  "Base Block",
  "Jump Sprint",
  "Sloped Block",
  "Moving Platform",
  "Remove Tool",
];

const toolClassesMap = {
  "Spawn Point": "spawn",
  Star: "star",
  "Base Block": "base",
  "Jump Sprint": "jump",
  "Sloped Block": "sloped",
  "Moving Platform": "moving",
};

const selectedTool = ref(null);

const mapSize = ref({ w: 10, h: 10 });

function initMapData() {
  const { w, h } = mapSize.value;
  return [...Array(h)].map(() => Array(w));
}

const mapData = ref(initMapData());

function blockClass(x, y) {
  const cs = [];

  // 已經放置在 map 上的 block 的 class
  const placedBlockClass = toolClassesMap[mapData.value[x][y]];

  // 如果有設置 tool
  placedBlockClass && cs.push(placedBlockClass);

  if (currentPoint.value) {
    const { x: cx, y: cy } = currentPoint.value;

    if (dragging.value) {
      // 如果當前 block 在 draggingPath 中，顯示 preview
      if (
        draggingPath.value &&
        draggingPath.value.some(({ x: dx, y: dy }) => dx === x && dy === y)
      ) {
        cs.push(`base-preview`);
      }
    } else if (selectedTool.value && x == cx && y == cy) {
      // 鼠標 hover 時顯示 preview
      const hoverClass = toolClassesMap[selectedTool.value];
      hoverClass && cs.push(`${hoverClass}-preview`);
    }
  }

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

  if (selectedTool.value === "Base Block") {
    const { x: sx, y: sy } = startPoint.value;
    const { x: cx, y: cy } = currentPoint.value;

    // 必須是同一行或者同一列
    if (sx !== cx && sy !== cy) return;

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

function mouseDownOnBlock(x, y) {
  startPoint.value = { x, y };
  dragging.value = true;
}

function mouseoverOnBlock(x, y) {
  currentPoint.value = { x, y };
}

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
        // 如果在同一格 mouse down & up，就放置對應的 block
        mapData.value[cx][cy] = selectedTool.value;
      } else if (dragging.value) {
        // 如果是在 dragging
      }

      break;
  }
}

function mouseMove(e) {}

function mouseDownOnScreen(x, y) {}
function mouseUpOnScreen(e) {
  startPoint.value = null;
  dragging.value = false;
}

onMounted(() => {
  document.addEventListener("mousedown", mouseDownOnScreen);
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUpOnScreen);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", mouseDownOnScreen);
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUpOnScreen);
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
        <button v-for="tool in tools" :key="tool" @click="selectedTool = tool">
          {{ tool }}
        </button>
      </div>

      <div class="game">
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
      {{ startPoint }}
      {{ currentPoint }}
      {{ dragging }}
      {{ draggingPath }}
    </footer>
  </div>
</template>

<style scoped>
.game {
  margin: 1rem 0;

  .row {
    display: flex;

    .block {
      width: 50px;
      height: 50px;
      border: 1px solid #ccc;

      &.base {
        background: #ccc;
      }
      &.base-preview {
        background: #eee;
      }
    }
  }
}
</style>
