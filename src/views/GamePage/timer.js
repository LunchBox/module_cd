import { ref, computed } from "vue";

export const timer = ref(0);

let intervalId = null;

export function formatTimer(t) {
  const hours = String(Math.floor(t / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const seconds = String(Math.floor(t % 60)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export const formattedTime = computed(() => {
  return formatTimer(timer.value);
});

export const startTimer = () => {
  if (intervalId) return; // 防止重複啟動
  intervalId = setInterval(() => {
    timer.value++;
  }, 1000);
};

export const stopTimer = () => {
  clearInterval(intervalId);
  intervalId = null;
};

export const resetTimer = () => {
  stopTimer();
  timer.value = 0;
};
