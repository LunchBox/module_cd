<script setup>
import { ref, computed, onMounted } from "vue";

import { CELL_SIZE } from "./config";

const props = defineProps(["data"]);

const moving_rate = 1;
let diff = moving_rate;

function render() {
  props.data.offset += diff;

  if (props.data.offset >= CELL_SIZE) diff = -moving_rate;
  if (props.data.offset <= -CELL_SIZE) diff = moving_rate;
  requestAnimationFrame(render);
}

const blockStyle = computed(() => {
  return { left: `${0 + props.data.offset}px`, width: `${CELL_SIZE}px` };
});

onMounted(() => {
  render();
});
</script>
<template>
  <div class="moving-block" :style="blockStyle"></div>
</template>

<style>
.moving-block {
  position: absolute;
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  background: #333;
}
</style>
