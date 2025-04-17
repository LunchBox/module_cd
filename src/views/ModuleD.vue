<template>
  <div>
    <h2>Module D ・ 游戏功能与交互</h2>

    <button @click="$router.push('/')">Home</button>

    <button @click="$router.push('/instructions')">
      说明页（Instructions page）
    </button>

    <button @click="$router.push('/map-preview')">
      地图预览页（Map Preview Page）
    </button>

    <button @click="$router.push('/game')">游戏页（Game Page）</button>
  </div>
</template>
