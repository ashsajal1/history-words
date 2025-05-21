<template>
  <nav class="flex items-center justify-between p-4 border-b dark:border-b-gray-700">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-8">
        <RouterLink
          to="/"
          class="text-2xl font-bold select-none cursor-pointer hover:text-primary-500 transition-colors"
          >BattleWords</RouterLink
        >
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center gap-4">
        <RouterLink
          to="/quiz"
          class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Brain :size="18" stroke-width="1.5" />
          <span>Quiz</span>
        </RouterLink>
        <RouterLink
          to="/import"
          class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <BookPlus :size="18" stroke-width="1.5" />
          <span>Import</span>
        </RouterLink>
      </div>
      <div class="flex items-center gap-4">
        <Button
          size="small"
          rounded
          variant="outlined"
          @click="next()"
          class="hidden lg:flex items-center gap-2"
        >
          <SunDim :size="20" v-if="mode === 'dark'" />
          <Moon :size="20" v-if="mode === 'light'" />
          <MonitorDot :size="16" v-if="mode === 'auto'" />
          <span class="capitalize">{{ mode }}</span>
        </Button>
        <RouterLink to="/settings">
          <Button size="small" class="hidden lg:flex items-center gap-2">
            <Settings stroke-width="1.5" :size="20" />
            <span>Settings</span>
          </Button>
        </RouterLink>
        <Button size="small" class="lg:hidden" @click="isSidebarOpen = !isSidebarOpen">
          <Menu :size="20" />
        </Button>
      </div>
    </div>

    <!-- Mobile Sidebar -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>
    <div
      class="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden"
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
    >
      <div class="p-4 flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Menu</h2>
          <Button size="small" @click="isSidebarOpen = false">
            <X :size="20" />
          </Button>
        </div>
        <RouterLink
          to="/quiz"
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Brain :size="16" stroke-width="1.5" />Quiz
        </RouterLink>
        <button
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          @click="next()"
        >
          <SunDim :size="20" v-if="mode === 'dark'" />
          <Moon :size="20" v-if="mode === 'light'" />
          <MonitorDot :size="16" v-if="mode === 'auto'" />
          {{ mode }}
        </button>
        <RouterLink
          to="/settings"
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Settings :size="20" stroke-width="1.5" />Settings
        </RouterLink>
        <RouterLink
          to="/import"
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <BookPlus :size="16" stroke-width="1.5" />Import json
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useColorMode, useCycleList } from "@vueuse/core";
import { Button } from "primevue";
import { watchEffect, ref } from "vue";
import {
  SunDim,
  Moon,
  MonitorDot,
  Settings,
  BookPlus,
  Brain,
  Menu,
  X,
} from "lucide-vue-next";

const isSidebarOpen = ref(false);

const mode = useColorMode({
  emitAuto: true,
  modes: {
    contrast: "dark contrast",
    cafe: "cafe",
  },
});

const { state, next } = useCycleList(["dark", "light", "auto"] as const, {
  initialValue: mode,
});

watchEffect(() => (mode.value = state.value));
</script>

<style scoped>
.hover\:text-primary-500:hover {
  @apply text-primary-500;
}
</style>
