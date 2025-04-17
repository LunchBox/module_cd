import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import MapEditor from "@/views/mapEditor/MapEditor.vue";
import GameDemo from "@/views/GameDemo.vue";
import InstructionPage from "@/views/InstructionPage.vue";
import MapPreviewPage from "@/views/MapPreviewPage.vue";
import ModuleD from "@/views/ModuleD.vue";
import RanksPage from "@/views/RanksPage.vue";
import GamePage from "@/views/GamePage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    { path: "/instructions", component: InstructionPage },
    { path: "/editor", component: MapEditor },
    { path: "/demo", component: GameDemo },
    { path: "/map-preview", component: MapPreviewPage },
    { path: "/ranks", component: RanksPage },
    { path: "/module_d", component: ModuleD },
    { path: "/game", component: GamePage },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
