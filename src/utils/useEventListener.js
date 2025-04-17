import { onMounted, onUnmounted } from "vue";

// useEventListener 只能在 .vue 文件里使用，不能再其他的 js 里使用
export default function useEventListener(domElem, eventName, func) {
  onMounted(() => {
    domElem.addEventListener(eventName, func);
  });

  onUnmounted(() => {
    domElem.removeEventListener(eventName, func);
  });
}
