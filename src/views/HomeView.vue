<script setup>
import { useRouter } from "vue-router";
import { importData } from "./useMapEditor";

const router = useRouter();
async function loadData() {
  await importData();
  router.push("/editor");
}
</script>

<template>
  <div>
    <h2>主页面（Main Page）</h2>

    <button @click="$router.push('/editor')">地图编辑器</button>

    <button @click="$router.push('/instructions')">说明页</button>

    <button>繼續</button>

    <button @click="loadData">加载地图文件</button>

    <button @click="$router.push('/module_d')">Module D</button>
  </div>
</template>
