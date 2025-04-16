<script setup>
import MapGrid from "./MapGrid.vue";
import { currentLevel } from "./useMapEditor";
</script>

<template>
  <div>
    <div>
      <button @click="$router.push('/editor')">Back</button>
    </div>

    <div>
      <header>
        <h2>
          Map Editor - Level
          {{ currentLevel }}
        </h2>
      </header>
      <MapGrid></MapGrid>
    </div>
  </div>
</template>
