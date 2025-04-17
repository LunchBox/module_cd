import { ref } from "vue";

export const timer = ref(null);

function resetTimer() {
  timer.value = "00:00:00";
}
