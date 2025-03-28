<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-bold flex items-center gap-2">
          {{ props.word.en }} - {{ props.word.bn }}
          <Button
            @click="speakWord"
            :disabled="isPlaying"
            class="p-button-rounded p-button-text p-button-sm"
          >
            <Volume2Icon :size="16" :stroke-width="1.5" />
          </Button>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Battle: {{ props.word.battle }}
        </p>
      </div>
    </div>
    <div class="mt-2">
      <p class="text-sm flex items-center gap-2">
        {{ props.word.sentence }}
        <Button
          @click="speakSentence"
          :disabled="isPlaying"
          class="p-button-rounded p-button-text p-button-sm"
        >
          <Volume2Icon :size="16" :stroke-width="1.5" />
        </Button>
      </p>
      <p class="text-sm flex items-center gap-2 mt-1">
        {{ props.word.bnSentence }}
      </p>
    </div>

    <!-- Stop Button -->
    <Button
      v-if="isPlaying"
      @click="stopSpeaking"
      class="fixed bottom-6 left-6 p-button-rounded p-button-danger"
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
