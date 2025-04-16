import { ref } from "vue";

export const accomplishedLevels = ref(new Set());

// 碰撞檢測
export function intersect(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// 限制數值範圍
export function minMax(val, min, max) {
  return Math.max(Math.min(val, max), min);
}
