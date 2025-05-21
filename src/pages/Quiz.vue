<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <!-- Battle Selection -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4 dark:text-white">Select a Battle</h2>
      <Dropdown
        v-model="selectedBattle"
        :options="wordStore.battles"
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-14rem"
        @change="handleBattleChange"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center gap-2">
            <Swords :size="16" class="text-gray-500" />
            <span>{{ slotProps.value.name }}</span>
          </div>
          <span v-else>{{ slotProps.placeholder }}</span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center gap-2">
            <Swords :size="16" class="text-gray-500" />
            <span>{{ slotProps.option.name }}</span>
          </div>
        </template>
      </Dropdown>
    </div>

    <!-- Quiz Section -->
    <div
      v-if="currentQuestion"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300"
    >
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
          </span>
          <span class="text-sm font-medium text-primary-500"> Score: {{ score }} </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-primary-500 h-2 rounded-full transition-all duration-300"
            :style="{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }"
          ></div>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-2 dark:text-white">
          What is the meaning of:
        </h3>
        <p class="text-2xl font-bold text-primary-500 dark:text-primary-400">
          {{ currentQuestion.en }}
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-for="(option, index) in currentOptions"
          :key="index"
          class="p-4 border rounded-lg cursor-pointer transition-all duration-200"
          :class="{
            'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700': !selectedAnswer,
            'bg-primary-50 dark:bg-primary-900/20 border-primary-500':
              selectedAnswer === option && selectedAnswer === currentQuestion.bn,
            'bg-red-50 dark:bg-red-900/20 border-red-500':
              selectedAnswer === option && selectedAnswer !== currentQuestion.bn,
            'opacity-50 cursor-not-allowed': selectedAnswer && selectedAnswer !== option,
          }"
          @click="selectAnswer(option)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
              :class="{
                'border-gray-300 dark:border-gray-600': !selectedAnswer,
                'border-primary-500 bg-primary-500':
                  selectedAnswer === option && selectedAnswer === currentQuestion.bn,
                'border-red-500 bg-red-500':
                  selectedAnswer === option && selectedAnswer !== currentQuestion.bn,
              }"
            >
              <Check v-if="selectedAnswer === option" :size="14" class="text-white" />
            </div>
            <span class="text-gray-700 dark:text-gray-200">{{ option }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <Button
          label="Previous"
          icon="pi pi-arrow-left"
          @click="previousQuestion"
          :disabled="currentQuestionIndex === 0"
          class="p-button-secondary"
        />
        <Button
          :label="isLastQuestion ? 'Finish' : 'Next'"
          icon="pi pi-arrow-right"
          iconPos="right"
          @click="nextQuestion"
          :disabled="!selectedAnswer"
          class="p-button-primary"
        />
      </div>
    </div>

    <!-- Results Section -->
    <div
      v-if="showResults"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
    >
      <div class="mb-6">
        <Trophy :size="48" class="mx-auto mb-4 text-primary-500" />
        <h2 class="text-2xl font-bold mb-2 dark:text-white">Quiz Results</h2>
        <p class="text-xl mb-4 text-gray-600 dark:text-gray-300">
          You scored {{ score }} out of {{ questions.length }}
        </p>
        <div class="text-4xl font-bold text-primary-500 mb-6">
          {{ Math.round((score / questions.length) * 100) }}%
        </div>
      </div>
      <div class="space-y-3">
        <Button label="Restart Quiz" @click="restartQuiz" class="p-button-primary" />
        <Button
          label="Try Another Battle"
          @click="selectedBattle = null"
          class="p-button-outlined"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useWordStore } from "../store/wordStore";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import { Check, Swords, Trophy } from "lucide-vue-next";

interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

interface Battle {
  id?: number;
  name: string;
}

interface QuizQuestion extends Word {
  options: string[];
}

const wordStore = useWordStore();
const selectedBattle = ref<Battle | null>(null);
const questions = ref<QuizQuestion[]>([]);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref("");
const score = ref(0);
const showResults = ref(false);
const hasMoreWords = ref(true);

// Computed properties
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1
);
const currentOptions = computed(() => {
  if (!currentQuestion.value) return [];
  return currentQuestion.value.options;
});

// Methods
const handleBattleChange = async () => {
  if (selectedBattle.value) {
    await wordStore.selectBattle(selectedBattle.value);
    await generateQuiz();
  }
};

const generateQuiz = async (append = false) => {
  if (!append) {
    currentQuestionIndex.value = 0;
    selectedAnswer.value = "";
    score.value = 0;
    showResults.value = false;
  }

  const allWords = wordStore.words;
  const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
  const newQuestions = shuffledWords.slice(0, 10).map((word) => {
    // Get 3 random wrong answers
    const wrongAnswers = allWords
      .filter((w) => w.bn !== word.bn)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.bn);

    // Combine correct and wrong answers and shuffle
    const options = [...wrongAnswers, word.bn].sort(() => Math.random() - 0.5);

    return {
      ...word,
      options,
    };
  });

  if (append) {
    questions.value = [...questions.value, ...newQuestions];
  } else {
    questions.value = newQuestions;
  }

  // Check if we have more words to load
  hasMoreWords.value = wordStore.hasMore;
};

const selectAnswer = (answer: string) => {
  if (selectedAnswer.value) return; // Prevent changing answer
  selectedAnswer.value = answer;
  if (answer === currentQuestion.value?.bn) {
    score.value++;
  }
};

const nextQuestion = async () => {
  if (isLastQuestion.value) {
    if (hasMoreWords.value) {
      // Load more words if available
      await wordStore.loadMore();
      await generateQuiz(true);
    } else {
      showResults.value = true;
    }
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value = "";
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = "";
  }
};

const restartQuiz = () => {
  generateQuiz();
};

// Initialize
onMounted(async () => {
  await wordStore.loadBattles();
});
</script>

<style scoped>
.p-button {
  @apply px-4 py-2 rounded-lg transition-all duration-200;
}

.p-dropdown {
  @apply w-full;
}

.p-dropdown-panel {
  @apply dark:bg-gray-800 dark:border-gray-700;
}

.p-dropdown-item {
  @apply dark:text-gray-200 dark:hover:bg-gray-700;
}

.p-dropdown-item.p-highlight {
  @apply dark:bg-primary-900/20;
}

/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar {
  @apply w-2;
}

.dark ::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

.dark ::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

.dark ::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>
