<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-bold">{{ word.en }} - {{ word.bn }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Battle: {{ word.battle }}
        </p>
      </div>
    </div>
    <div class="mt-2">
      <p class="text-sm">{{ word.sentence }}</p>
      <p class="text-sm mt-1">{{ word.bnSentence }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

defineProps<{
  word: Word;
}>();
</script>