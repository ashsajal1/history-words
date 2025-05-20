import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./pages/Home.vue";
import AboutView from "./pages/About.vue";
import NotFound from "./pages/NotFound.vue";
import Import from "./pages/Import.vue";
import Settings from "./pages/Settings.vue";
import Quiz from "./pages/Quiz.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { title: "Home", description: "Explore words!" },
  },
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
  {
    path: "/quiz",
    component: Quiz,
    meta: {
      title: "Quiz Page",
      description: "Play a quiz on this page.",
    },
  },
  {
    path: "/settings",
    component: Settings,
    meta: {
      title: "Settings",
      description: "Change your settings on this page.",
    },
  },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
