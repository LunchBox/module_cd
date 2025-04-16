<script setup>
import { ref, onMounted } from "vue";

const pos = ref(0);

const moving_rate = 1;
let diff = moving_rate;

function render() {
  pos.value += diff;

  if (pos.value >= 100) diff = -moving_rate;
  if (pos.value <= 0) diff = moving_rate;
  requestAnimationFrame(render);
}

onMounted(() => {
  render();
});
</script>
<template>
  <div class="moving-wrapper">
    <div class="moving-block" :style="{ left: `${0 + pos}px` }"></div>
  </div>
</template>

<style>
.moving-wrapper {
  border: 1px solid blue;
  position: absolute;

  top: 0;
  left: -50px;
  right: -50px;
  bottom: 0;

  .moving-block {
    position: absolute;
    width: 50px;
    height: 100%;
    top: 0;
    left: 0;

    background: #333;
  }
}
</style>
