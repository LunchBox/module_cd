<script setup>
import { CELL_SIZE, MAP_COLS, MAP_ROWS } from "@/stores/config";
import MovingPlatform from "./MovingPlatform.vue";

const emits = defineEmits([
  "mousedown-on-block",
  "mouseover-on-block",
  "mouseup-on-block",
]);

const props = defineProps(["level", "mapData", "blockClass"]);

// function 也可以作為 props 傳遞
function blockClass(x, y) {
  return props.blockClass instanceof Function
    ? props.blockClass(x, y)
    : props.mapData[x][y]?.type;
}

document.body.style.setProperty("--block-size", CELL_SIZE + "px");
</script>
<template>
  <div class="game-grid" @contextmenu.prevent>
    <div v-for="(_, y) in MAP_ROWS" :id="y" class="row">
      <template v-for="(_, x) in MAP_COLS">
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
  background: #6098fe;
  display: inline-block;

  .row {
    display: flex;

    .block {
      width: var(--block-size);
      height: var(--block-size);
      position: relative;

      /* 所有 block 用 ::before, .preview.taken 用 ::after */

      &.base::before,
      &.base-preview::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: #333;

        background: no-repeat url("@/assets/rock.png") -150px 0;
        background-size: auto var(--block-size);
      }

      /* 星星 */
      &.star::before,
      &.star-preview::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;

        background: no-repeat url("@/assets/gold.gif") 0px 0;
        background-size: auto var(--block-size);
      }

      /* 彈簧 */
      &.jump::before,
      &.jump-preview::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;

        background: no-repeat url("@/assets/rock.png") -250px 0;
        background-size: auto var(--block-size);
      }

      /* 出生點 */
      &.spawn::before,
      &.spawn-preview::before {
        content: "💫";
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        font-size: 2rem;
      }

      /* 斜坡 */
      &.sloped::before,
      &.sloped-preview::before {
        content: "";
        position: absolute;
        border-color: transparent #333 #333 transparent;
        border-style: solid;
        border-width: 25px;
        width: 0;
        height: 0;
      }

      /* 水平移動平台 */
      &.moving::before,
      &.moving-preview::before {
        content: " ";
        position: absolute;
        width: 150px;
        height: 100%;
        margin-left: -50px;
      }
      &.moving-preview::before {
        background: #ccc;
        z-index: -1;
      }

      /* 垂直移動平台 */
      &.moving-y::before,
      &.moving-y-preview::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 150px;
        margin-top: -50px;
      }
      &.moving-y-preview::before {
        background: #ccc;
        z-index: -1;
      }
    }

    .preview {
      opacity: 0.5;
    }

    .preview.taken::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(200, 0, 0, 0.5);
    }
  }
}
</style>
