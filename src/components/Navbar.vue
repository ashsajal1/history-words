<template>
  <nav
    class="flex items-center justify-between p-4 border-b dark:border-b-gray-700"
  >
    <RouterLink to="/" class="text-2xl font-bold select-none cursor-pointer"
      >BattleWords</RouterLink
    >

    <div class="flex items-center justify-between gap-2">
      <Button rounded variant="outlined" @click="next()">
        <SunDim :size="20" v-if="mode === 'dark'" />
        <Moon :size="20" v-if="mode === 'light'" />
        <MonitorDot :size="16" v-if="mode === 'auto'" />{{ mode }}
      </Button>
      <RouterLink to="/settings">
        <Button
          ><Settings stroke-width="1.5" :size="20"
        /></Button>
      </RouterLink>
      <RouterLink to="/import">
        <Button><BookPlus :size="16" stroke-width="1.5" />Import json</Button>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useColorMode, useCycleList } from "@vueuse/core";
import { Button } from "primevue";
import { watchEffect } from "vue";
import { SunDim, Moon, MonitorDot, Settings, BookPlus } from "lucide-vue-next";

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
