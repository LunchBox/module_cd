<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import MapGrid from "./MapGrid.vue";

import { LEVELS } from "./config";
import {
  mapSize,
  currentLevel,
  mapData,
  toLevel,
  importData,
  exportData,
  levelAccomplished,
} from "./useMapEditor";
import useEventListener from "./useEventListener";

const tools = Object.freeze({
  spawn: "Spawn Point",
  star: "Star",
  base: "Base Block",
  jump: "Jump Sprint",
  sloped: "Sloped Block",
  moving: "Moving Platform",
  remove: "Remove Tool",
});

import { placeBlock, removeBlock } from "./sceneTools";

const router = useRouter();
function toHome() {
  if (!confirm("Map changes are not saved.Doyou want to return?")) return;
  router.push({ path: "/" });
}

function toDemo() {
  if (!validMap()) return alert("关卡中包含至少一个 Start 和一个Spawn Point");
  selectedTool.value = null;
  router.push({ path: "/demo" });
}

// ---- map editor

const selectedTool = ref(null);

function validMap() {
  const ds = mapData.value.flat();
  const stars = ds.filter((d) => d?.type === "star").length;
  const spawn = ds.filter((d) => d?.type === "spawn").length;
  return stars >= 1 && spawn === 1;
}

function blockClass(x, y) {
  const cs = [];

  // 如果已放置 block
  cs.push({ [mapData.value[x][y]?.type]: !!mapData.value[x][y] });

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
  if (
    mapData.value[x][y] &&
    !mapData.value[x][y].allow?.includes(selectedTool.value)
  ) {
    return false;
  }

  // 左側不是星星不能放斜坡
  if (
    mapData.value[x - 1]?.[y] &&
    mapData.value[x - 1]?.[y]?.type !== "star" &&
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

// ---- events

function mouseDownOnBlock(x, y) {
  startPoint.value = { x, y };
  dragging.value = true;
}

function mouseOverOnBlock(x, y) {
  currentPoint.value = { x, y };
}

// 在 block 上 mouse up，通常用來 place blocks
function mouseUpOnBlock(x, y) {
  const { x: sx, y: sy } = startPoint.value;
  const { x: cx, y: cy } = currentPoint.value;

  const sameBlock = sx === cx && sy === cy;

  switch (selectedTool.value) {
    case "remove":
      if (!sameBlock) break;
      removeBlock(mapData.value, cx, cy);
      break;

    default:
      if (sameBlock) {
        // 在同一格 mouse down & up，就放置對應的 block
        if (available(cx, cy)) {
          placeBlock(mapData.value, selectedTool.value, cx, cy);
        }
      } else if (dragging.value && selectedTool.value === "base") {
        // 是在 dragging
        draggingPath.value.forEach(({ x: px, y: py }) => {
          if (available(px, py)) {
            placeBlock(mapData.value, selectedTool.value, px, py);
          }
        });
      }

      break;
  }
}

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

useEventListener(document, "mouseup", mouseUpOnScreen);
useEventListener(document, "keydown", keyDown);
</script>
<template>
  <div class="map-editor">
    <header>
      <h2>
        Map Editor - Level
        {{ currentLevel }}

        <span v-if="levelAccomplished"> !!! Accomplished !!!</span>
      </h2>

      <div class="level-selector">
        <button v-for="(_, i) in LEVELS" :key="i" @click="toLevel(i)">
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

      <MapGrid
        @mousedown-on-block="mouseDownOnBlock"
        @mouseover-on-block="mouseOverOnBlock"
        @mouseup-on-block="mouseUpOnBlock"
        :mapData="mapData"
        :blockClass="blockClass"
      ></MapGrid>
    </main>
    <footer>
      <button @click="toHome">Home</button>

      <button @click="toDemo">Play Demo</button>

      <button @click="exportData">Export</button>
      <button @click="importData">Import</button>
      <div>
        {{ selectedTool }}
      </div>
    </footer>
  </div>
</template>

<style scoped></style>
