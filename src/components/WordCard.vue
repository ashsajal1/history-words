<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="font-bold flex items-center gap-2 text-lg">
          <span class="text-primary-600 dark:text-primary-400">{{ props.word.en }}</span>
          <span class="text-gray-500 dark:text-gray-400">-</span>
          <span class="text-primary-600 dark:text-primary-400">{{ props.word.bn }}</span>
          <Button
            @click="speakWord"
            :disabled="isPlaying"
            class="p-button-rounded p-button-text p-button-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            :class="{ 'opacity-50': isPlaying }"
          >
            <Volume2Icon :size="16" :stroke-width="1.5" />
          </Button>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
            {{ props.word.battle }}
          </span>
        </p>
      </div>
    </div>
    <div class="mt-4 space-y-3">
      <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
        <p class="text-sm flex items-center gap-2">
          <span class="text-gray-700 dark:text-gray-300">{{ props.word.sentence }}</span>
          <Button
            @click="speakSentence"
            :disabled="isPlaying"
            class="p-button-rounded p-button-text p-button-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            :class="{ 'opacity-50': isPlaying }"
          >
            <Volume2Icon :size="16" :stroke-width="1.5" />
          </Button>
        </p>
        <p class="text-sm flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
          {{ props.word.bnSentence }}
        </p>
      </div>
    </div>

    <!-- Stop Button -->
    <Button
      v-if="isPlaying"
      @click="stopSpeaking"
      class="fixed bottom-6 right-6 p-button-rounded p-button-danger shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <VolumeXIcon :size="20" :stroke-width="1.5" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import { Volume2Icon, VolumeXIcon } from "lucide-vue-next";
import { useSpeaker } from "../composables/useSpeaker";

interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

const props = defineProps<{
  word: Word;
}>();

// Initialize speakers for different languages
const englishSpeaker = useSpeaker({
  lang: "en-US",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const bengaliSpeaker = useSpeaker({
  lang: "bn-BD",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

// Computed property to check if either speaker is playing
const isPlaying = computed(
  () => englishSpeaker.isPlaying.value || bengaliSpeaker.isPlaying.value
);

const speakWord = async () => {
  await englishSpeaker.speak(props.word.en);
  await bengaliSpeaker.speak(props.word.bn);
};

const speakSentence = async () => {
  await englishSpeaker.speak(props.word.sentence);
  await bengaliSpeaker.speak(props.word.bnSentence);
};

const stopSpeaking = () => {
  englishSpeaker.stop();
  bengaliSpeaker.stop();
};
</script>

<style scoped>
.p-button {
  @apply transition-all duration-200;
}

.p-button:not(:disabled):hover {
  @apply transform scale-105;
}

.p-button:not(:disabled):active {
  @apply transform scale-95;
}
</style>
