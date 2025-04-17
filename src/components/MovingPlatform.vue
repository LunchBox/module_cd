<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

import { CELL_SIZE } from "@/libs/config";

import { freeze } from "@/libs/playingLevel";

const props = defineProps(["data", "vertical"]);

const moving_rate = 1;
let diff = moving_rate;

let handler;

function movePlatform() {
  if (freeze.value) return;

  props.data.offset += diff;

  if (props.data.offset >= CELL_SIZE) diff = -moving_rate;
  if (props.data.offset <= -CELL_SIZE) diff = moving_rate;
}

onMounted(() => {
  if (handler) clearInterval(handler);
  handler = setInterval(movePlatform, 20);
});

onUnmounted(() => {
  if (handler) clearInterval(handler);
});

const blockStyle = computed(() => {
  if (props.vertical) {
    return { top: `${0 + props.data.offset}px`, width: `${CELL_SIZE}px` };
  } else {
    return { left: `${0 + props.data.offset}px`, width: `${CELL_SIZE}px` };
  }
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
