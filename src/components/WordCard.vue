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
        <Button
          @click="speakBnSentence"
          :disabled="isPlaying"
          class="p-button-rounded p-button-text p-button-sm"
        >
          <Volume2Icon :size="16" :stroke-width="1.5" />
        </Button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpeechSynthesis } from "@vueuse/core";
import Button from "primevue/button";
import { Volume2Icon } from "lucide-vue-next";

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

const { isPlaying } = useSpeechSynthesis(props.word.en, {
  lang: "en-US",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const { speak: speakEnWord } = useSpeechSynthesis(props.word.en, {
  lang: "en-US",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const { speak: speakEnSentence } = useSpeechSynthesis(props.word.sentence, {
  lang: "en-US",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const { speak: speakBnWord } = useSpeechSynthesis(props.word.bn, {
  lang: "bn-BD",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const { speak: speakBnSentence } = useSpeechSynthesis(props.word.bnSentence, {
  lang: "bn-BD",
  rate: 0.9,
  pitch: 1,
  volume: 1,
});

const speakWord = () => {
  speakEnWord();
  //sleep few seconds based on word length
  const wordLength = props.word.en.split(" ").length;
  const sleepTime = wordLength * 0.5 * 1000 + 300;
  setTimeout(() => {
    speakBnWord();
  }, sleepTime);
  speakBnWord();
};

const speakSentence = () => {
  // Speak English first
  speakEnSentence();

  // Calculate sleep time based on sentence length
  const sentenceLength = props.word.sentence.split(" ").length;
  const sleepTime = sentenceLength * 0.7 * 1000 + 500;

  // Then, speak Bengali after the delay
  setTimeout(() => {
    speakBnSentence();
  }, sleepTime);
};
</script>
