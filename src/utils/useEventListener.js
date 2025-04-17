import { onMounted, onUnmounted } from "vue";

export default function useEventListener(domElem, eventName, func) {
  onMounted(() => {
    domElem.addEventListener(eventName, func);
  });

  onUnmounted(() => {
    domElem.removeEventListener(eventName, func);
  });
}
