import { ref, computed, watch } from "vue";

import { LEVELS, MAP_COLS, MAP_ROWS } from "@/stores/config";

// entire game data
export const gameData = ref([...Array(LEVELS)].map(() => initMapData()));

export const currentLevel = ref(0);

export const mapData = computed(() => gameData.value[currentLevel.value]);

export const accomplishedLevels = ref(new Set());

export const levelAccomplished = computed(() => {
  return accomplishedLevels.value.has(currentLevel.value);
});

// any changes, remove the accomplished mark
watch(
  () => mapData,
  () => {
    accomplishedLevels.value.delete(currentLevel.value);
  },
  { deep: true }
);

function initMapData() {
  return [...Array(MAP_ROWS)].map(() => Array(MAP_COLS));
}

export function toLevel(lv) {
  currentLevel.value = lv;
}

// ---- import / export
export function exportData() {
  const jsonStr = JSON.stringify(gameData.value);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "game.json"; // 檔名
  a.click();
}

export async function importData() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = JSON.parse(e.target.result); // 將文件內容轉換為物件

        gameData.value = data;
        currentLevel.value = 0;

        resolve();
      };

      reader.readAsText(file); // 讀取文件內容
    });

    input.click();
  });
}
