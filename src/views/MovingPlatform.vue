<script setup>
import { ref, onMounted } from "vue";

import { CELL_SIZE } from "./config";

const pos = ref(0);

const moving_rate = 1;
let diff = moving_rate;

function render() {
  pos.value += diff;

  if (pos.value >= CELL_SIZE * 2) diff = -moving_rate;
  if (pos.value <= 0) diff = moving_rate;
  requestAnimationFrame(render);
}

onMounted(() => {
  render();
});
</script>
<template>
  <div
    class="moving-wrapper"
    :style="{ left: `-${CELL_SIZE}px`, right: `-${CELL_SIZE}px` }"
  >
    <div
      class="moving-block"
      :style="{ left: `${0 + pos}px`, width: `${CELL_SIZE}px` }"
    ></div>
  </div>
</template>

<style>
.moving-wrapper {
  border: 1px solid blue;
  position: absolute;

  top: 0;
  bottom: 0;

  .moving-block {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;

    background: #333;
  }
}
</style>
