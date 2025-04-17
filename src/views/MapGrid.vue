<script setup>
import { mapSize } from "./useMapEditor";

import MovingPlatform from "./MovingPlatform.vue";

const emits = defineEmits([
  "mousedown-on-block",
  "mouseover-on-block",
  "mouseup-on-block",
]);

const props = defineProps(["level", "mapData", "blockClass"]);

function blockClass(x, y) {
  return props.blockClass instanceof Function
    ? props.blockClass(x, y)
    : props.mapData[x][y]?.type;
}
</script>
<template>
  <div class="game-grid" @contextmenu.prevent>
    <div v-for="(_, y) in mapSize.h" :id="y" class="row">
      <template v-for="(cell, x) in mapSize.w">
        <div
          class="block"
          :class="blockClass(x, y)"
          @dragstart.prevent
          @mousedown.left="$emit('mousedown-on-block', x, y)"
          @mouseover="$emit('mouseover-on-block', x, y)"
          @mouseup.left="$emit('mouseup-on-block', x, y)"
        >
          <MovingPlatform
            v-if="mapData[x][y]?.type === 'moving'"
            :data="mapData[x][y]"
          ></MovingPlatform>
          <MovingPlatform
            v-if="mapData[x][y]?.type === 'moving-y'"
            :data="mapData[x][y]"
            :vertical="true"
          ></MovingPlatform>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.game-grid {
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
      &.moving-preview::before {
        content: " ";
        position: absolute;
        width: 150px;
        height: 100%;
        margin-left: -50px;
      }
      &.moving-preview {
        opacity: 0.5;

        &::before {
          background: #ccc;
          z-index: -1;
        }

        &.taken::before {
          background-color: tomato;
        }
      }

      /* 垂直移動平台 */
      &.moving-y::after,
      &.moving-y-preview::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 150px;
        margin-top: -50px;
      }
      &.moving-y-preview {
        opacity: 0.5;

        &::before {
          background: #ccc;
          z-index: -1;
        }

        &.taken::before {
          background-color: tomato;
        }
      }
    }
  }
}
</style>
