import { ref, computed } from "vue";

// ---- map basic info
export const LEVELS = 3;
export const CELL_SIZE = 50;

export const mapSize = ref({ w: 10, h: 10 });

// ---- game info
export const gameData = ref([...Array(LEVELS)].map(() => initMapData()));

export const currentLevel = ref(0);

export const mapData = computed(() => gameData.value[currentLevel.value]);

function initMapData() {
  const { w, h } = mapSize.value;
  return [...Array(h)].map(() => Array(w));
}

export function toLevel(lv) {
  currentLevel.value = lv;
}
