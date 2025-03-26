import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./pages/Home.vue";
import AboutView from "./pages/About.vue";
import NotFound from "./pages/NotFound.vue";
import Import from "./pages/Import.vue";

const routes = [
  { path: "/", component: HomeView },
  {
    path: "/about",
    component: AboutView,
    meta: {
      title: "About Us",
      description: "Learn more about us on this page.",
    },
  },
  {
    path: "/import",
    component: Import,
    meta: {
      title: "Import JSON data.",
      description: "Import JSON data on this page.",  
    },
  },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
