<script setup lang="ts">
import { ranks } from "@/stores/ranks";
</script>

<template>
  <h2>This is Ranks</h2>

  <div>
    <div v-for="(rank, i) in ranks">
      Level: {{ rank.level }}: {{ i }}, {{ rank.nickName }}, {{ rank.times }},
      {{ rank.lifes }}
    </div>
  </div>

  <div>
    <button @click="$router.push('/')">Home</button>
    <button @click="$router.push('/game')">Retry</button>
  </div>

  {{ ranks }}
</template>
