// 限制數值範圍
export default function minMax(val, min, max) {
  return Math.max(Math.min(val, max), min);
}
