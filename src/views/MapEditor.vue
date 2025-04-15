<script setup>
import { ref } from "vue";

const currentLevel = ref(1);
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
    <main></main>
    <footer>
      <button>Play Demo</button>
    </footer>
  </div>
</template>
