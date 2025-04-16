<script setup>
import { blockClass, mapSize } from "./useMapEditor";

const emits = defineEmits([
  "mousedown-on-block",
  "mouseover-on-block",
  "mouseup-on-block",
]);
</script>
<template>
  <div class="game" @contextmenu.prevent>
    <div v-for="(_, y) in mapSize.h" :id="y" class="row">
      <div
        v-for="(_, x) in mapSize.w"
        class="block"
        :key="x"
        :class="blockClass(x, y)"
        @dragstart.prevent
        @mousedown.left="$emit('mousedown-on-block', x, y)"
        @mouseover="$emit('mouseover-on-block', x, y)"
        @mouseup.left="$emit('mouseup-on-block', x, y)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.game {
  margin: 1rem 0;

  .row {
    display: flex;

    .block {
      width: 50px;
      height: 50px;
      border: 1px solid #ccc;
      position: relative;

      &.base,
      &.base-preview {
        background: #333;
      }
      &.base-preview {
        opacity: 0.5;

        &.taken {
          background: tomato;
        }
      }

      /* 星星 */
      &.star::after,
      &.star-preview::after {
        content: "⭐";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
      }
      &.star-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }

      /* 彈簧 */
      &.jump::after,
      &.jump-preview::after {
        content: "🆙";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
      }
      &.jump-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }

      /* 出生點 */
      &.spawn::after,
      &.spawn-preview::after {
        content: "💫";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
      }
      &.spawn-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }

      /* 斜坡 */
      &.sloped,
      &.sloped-preview {
        border-color: transparent #333 #333 transparent;
        border-style: solid;
        border-width: 25px;
        width: 0;
        height: 0;
      }
      &.sloped-preview {
        opacity: 0.5;

        &.taken {
          border-color: transparent tomato tomato transparent;
        }
      }

      /* 水平移動平台 */
      &.moving::after,
      &.moving-preview::after {
        content: "〰️";
        position: absolute;
        width: 150px;
        margin-left: -50px;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
        background: #ccc;
      }
      &.moving-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }

      /* 垂直移動平台 */
      &.moving-y::after,
      &.moving-y-preview::after {
        content: "〰️";
        position: absolute;
        width: 100%;
        height: 150px;
        margin-top: -50px;
        display: grid;
        place-content: center;
        font-size: 2rem;
        background: #ccc;
      }
      &.moving-y-preview {
        opacity: 0.5;

        &.taken::after {
          background-color: tomato;
        }
      }
    }
  }
}
</style>
