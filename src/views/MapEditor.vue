<script setup>
import { ref } from "vue";

const currentLevel = ref(1);

const tools = [
  { label: "Spawn Point" },
  { label: "Star" },
  { label: "Base Block" },
  { label: "Jump Sprint" },
  { label: "Sloped Block" },
  { label: "Moving Platform" },
  { label: "Remove Tool" },
];

const selectedTool = ref(null);

const mapSize = ref({ w: 10, h: 10 });
</script>
<template>
  <div class="map-editor">
    <header>
      <h2>
        Map Editor - Level
        {{ currentLevel }}
      </h2>

      <div class="level-selector">
        <button
          v-for="i in 3"
          :key="i"
          :class="{ active: currentLevel === i }"
          @click="currentLevel = i"
        >
          Level {{ i }}
        </button>
      </div>
    </header>
    <main>
      <div class="toolbox">
        <button v-for="tool in tools" :key="tool" @click="selectedTool = tool">
          {{ tool.label }}
        </button>
      </div>

      <div class="game">
        <div v-for="y in mapSize.h" :id="y" class="row">
          <div v-for="x in mapSize.w" :id="x" class="block"></div>
        </div>
      </div>
    </main>
    <footer>
      <button>Play Demo</button>
    </footer>
  </div>
</template>

<style scoped>
.game {
  margin: 1rem 0;
  .row {
    display: flex;
    .block {
      width: 50px;
      height: 50px;
      border: 1px solid #ccc;
    }
  }
}
</style>
