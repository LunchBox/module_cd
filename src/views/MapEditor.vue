<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import MapGrid from "./MapGrid.vue";

import {
  LEVELS,
  toLevel,
  gameData,
  currentLevel,
  mapData,
  selectedTool,
  initMapTools,
  mouseDownOnBlock,
  mouseOverOnBlock,
  mouseUpOnBlock,
} from "./useMapEditor";

const tools = Object.freeze({
  spawn: "Spawn Point",
  star: "Star",
  base: "Base Block",
  jump: "Jump Sprint",
  sloped: "Sloped Block",
  moving: "Moving Platform",
  remove: "Remove Tool",
});

initMapTools();

const router = useRouter();
function toHome() {
  if (!confirm("Map changes are not saved.Doyou want to return?")) return;

  router.push({ path: "/" });
}

function exportData() {
  const jsonStr = JSON.stringify(gameData.value);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "game.json"; // 檔名
  a.click();
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = JSON.parse(e.target.result); // 將文件內容轉換為物件
      console.log(data);

      mapData.value = gameData.value[0];
    };

    reader.readAsText(file); // 讀取文件內容
  });

  input.click();
}
</script>
<template>
  <div class="map-editor">
    <header>
      <h2>
        Map Editor - Level
        {{ currentLevel }}
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
        :level="currentLevel"
        @mousedown-on-block="mouseDownOnBlock"
        @mouseover-on-block="mouseOverOnBlock"
        @mouseup-on-block="mouseUpOnBlock"
      ></MapGrid>
    </main>
    <footer>
      <button @click="toHome">Home</button>
      <button>Play Demo</button>

      <button @click="exportData">Export</button>
      <button @click="importData">Import</button>
      <div>
        {{ selectedTool }}
      </div>
    </footer>
  </div>
</template>

<style scoped></style>
