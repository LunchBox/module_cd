<script setup></script>

<template>
  <div>
    <h2>This is Home Page</h2>

    <button @click="$router.push('/editor')">地图编辑器</button>

    <button @click="$router.push('/instructions')">
      说明页（Instructions page）
    </button>

    <button>加载地图文件</button>

    <button @click="$router.push('/module_d')">Module D</button>
  </div>
</template>
