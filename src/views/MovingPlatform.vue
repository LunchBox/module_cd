<script setup>
import { ref, computed, onMounted } from "vue";

import { CELL_SIZE } from "./config";

const props = defineProps(["data"]);

const moving_rate = 1;
let diff = moving_rate;

function render() {
  props.data.offset += diff;

  if (props.data.offset >= CELL_SIZE * 2) diff = -moving_rate;
  if (props.data.offset <= 0) diff = moving_rate;
  requestAnimationFrame(render);
}

const wrapperStyle = computed(() => {
  return { left: `-${CELL_SIZE}px`, right: `-${CELL_SIZE}px` };
});

const blockStyle = computed(() => {
  return { left: `${0 + props.data.offset}px`, width: `${CELL_SIZE}px` };
});

onMounted(() => {
  render();
});
</script>
<template>
  <div class="moving-wrapper" :style="wrapperStyle">
    <div class="moving-block" :style="blockStyle"></div>
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
