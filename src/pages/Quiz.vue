<template>
  <div class="container mx-auto p-4">
    <!-- Battle Selection -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Select a Battle</h2>
      <Dropdown
        v-model="selectedBattle"
        :options="wordStore.battles"
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-14rem"
        @change="handleBattleChange"
      />
    </div>

    <!-- Quiz Section -->
    <div
      v-if="currentQuestion"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div class="mb-4">
        <span class="text-sm text-gray-500"
          >Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</span
        >
      </div>

      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-2">What is the meaning of:</h3>
        <p class="text-2xl font-bold text-primary">{{ currentQuestion.en }}</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="(option, index) in currentOptions"
          :key="index"
          class="p-4 border rounded-lg cursor-pointer transition-colors"
          :class="{
            'hover:bg-gray-50 dark:hover:bg-gray-700': !selectedAnswer,
            'bg-primary-100 border-primary': selectedAnswer === option,
            'bg-red-100 border-red-500':
              selectedAnswer === option && selectedAnswer !== currentQuestion.bn,
            'bg-green-100 border-green-500':
              selectedAnswer === option && selectedAnswer === currentQuestion.bn,
          }"
          @click="selectAnswer(option)"
        >
          {{ option }}
        </div>
      </div>

      <div class="mt-6 flex justify-between">
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
        />
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="showResults" class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Quiz Results</h2>
      <p class="text-xl mb-4">Score: {{ score }} / {{ questions.length }}</p>
      <Button label="Restart Quiz" @click="restartQuiz" class="p-button-primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useWordStore } from "../store/wordStore";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";

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
    generateQuiz();
  }
};

const generateQuiz = () => {
  const allWords = wordStore.words;
  const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
  questions.value = shuffledWords.slice(0, 10).map((word) => {
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
  currentQuestionIndex.value = 0;
  selectedAnswer.value = "";
  score.value = 0;
  showResults.value = false;
};

const selectAnswer = (answer: string) => {
  if (selectedAnswer.value) return; // Prevent changing answer
  selectedAnswer.value = answer;
  if (answer === currentQuestion.value?.bn) {
    score.value++;
  }
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    showResults.value = true;
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
  @apply px-4 py-2 rounded-lg;
}

.p-dropdown {
  @apply w-full;
}
</style>
