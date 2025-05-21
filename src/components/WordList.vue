<template>
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">Imported Words</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredWords.length }} words
        </span>
      </div>
      <div class="flex items-center gap-3">
        <Button
          @click="handleDeleteDuplicates"
          :loading="store.loading"
          severity="danger"
          class="p-button-sm"
          :disabled="!store.words.length"
        >
          <Trash2 :size="16" class="mr-2" />
          Delete Duplicates
        </Button>
      </div>
    </div>

    <!-- Battle Filter -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Filter by Battle
      </label>
      <Select
        v-model="selectedBattle"
        :options="store.battleOptions"
        filter
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-64"
        @change="(event) => handleBattleChange(event.value)"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center">
            <Swords :size="16" class="mr-2 text-gray-500" />
            <div>{{ slotProps.value.name }}</div>
          </div>
          <span v-else>
            {{ slotProps.placeholder }}
          </span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center">
            <Swords :size="16" class="mr-2 text-gray-500" />
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
    </div>

    <!-- Loading State -->
    <div
      v-if="store.loading && !store.words.length"
      class="flex flex-col items-center justify-center py-12"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"
      ></div>
      <p class="text-gray-500 dark:text-gray-400">Loading your words...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!filteredWords.length"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="max-w-md mx-auto">
        <BookOpen :size="48" class="mx-auto mb-4 text-gray-400" />
        <h3 class="text-xl font-semibold mb-2">
          {{ store.battles.length ? "No Words Found" : "Welcome to BattleWords!" }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          {{
            store.battles.length
              ? "You have battles but no words yet."
              : "It looks like you don't have any battles yet."
          }}
          Would you like to add sample words from the Battle of Yarmouk?
        </p>
        <Button
          label="Add Sample Battle"
          icon="pi pi-plus"
          @click="addSampleBattle"
          :loading="loading"
          class="p-button-primary"
        />
      </div>
    </div>

    <!-- Word List -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TransitionGroup name="list">
          <WordCard
            v-for="(word, index) in filteredWords"
            :key="word.id || index"
            :word="word"
          />
        </TransitionGroup>
      </div>

      <!-- Load More Button -->
      <div v-if="store.hasMore" class="flex justify-center mt-8">
        <Button
          @click="store.loadMore"
          :loading="store.loadingMore"
          class="p-button-outlined"
          :disabled="store.loadingMore"
        >
          <Loader2 v-if="store.loadingMore" :size="16" class="mr-2 animate-spin" />
          {{ store.loadingMore ? "Loading..." : "Load More" }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Select from "primevue/select";
import Button from "primevue/button";
import WordCard from "./WordCard.vue";
import { useWordStore } from "../store/wordStore";
import { deleteAllWords } from "../services/dbService";
import { BookOpen, Loader2, Swords, Trash2 } from "lucide-vue-next";

const store = useWordStore();
const selectedBattle = ref<{ name: string; code: string } | null>(null);
const loading = ref(false);

// Local computed property for filtered words
const filteredWords = computed(() => {
  if (!selectedBattle.value) {
    return store.words;
  }
  return store.words.filter((word) => word.battle === selectedBattle.value?.name);
});

const handleBattleChange = (battle: { name: string; code: string } | null) => {
  selectedBattle.value = battle;
  store.selectBattle(battle ? { name: battle.name } : null);
};

const handleDeleteDuplicates = async () => {
  try {
    await store.deleteDuplicates();
  } catch (error) {
    console.error("Error deleting duplicates:", error);
  }
};

const sampleWords = [
  {
    battle: "Battle of Yarmouk",
    en: "Caliphate",
    bn: "খিলাফত",
    sentence: "The Rashidun Caliphate expanded rapidly after the Battle of Yarmouk.",
    bnSentence: "ইয়ারমুকের যুদ্ধের পর রাশিদুন খিলাফত দ্রুত প্রসারিত হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Byzantine",
    bn: "বাইজেন্টাইন",
    sentence: "The Byzantine Empire suffered a major defeat at Yarmouk.",
    bnSentence: "ইয়ারমুকে বাইজেন্টাইন সাম্রাজ্য একটি বড় পরাজয়ের সম্মুখীন হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Muslim",
    bn: "মুসলিম",
    sentence: "The Muslim forces were led by Khalid ibn al-Walid.",
    bnSentence: "মুসলিম বাহিনী খালিদ ইবনে আল-ওয়ালিদের নেতৃত্বে ছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Syria",
    bn: "সিরিয়া",
    sentence: "The Battle of Yarmouk took place in Syria in 636 CE.",
    bnSentence: "ইয়ারমুকের যুদ্ধ ৬৩৬ খ্রিস্টাব্দে সিরিয়ায় সংঘটিত হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Heraclius",
    bn: "হেরাক্লিয়াস",
    sentence: "Emperor Heraclius was the Byzantine ruler during the battle.",
    bnSentence: "সম্রাট হেরাক্লিয়াস যুদ্ধের সময় বাইজেন্টাইনের শাসক ছিলেন।",
  },
];

const addSampleBattle = async () => {
  try {
    loading.value = true;

    // If there are battles but no words, delete all existing battles and words
    if (store.battles.length) {
      // Delete all words first
      await deleteAllWords();
      // Reset the store state
      store.reset();
    }

    // Add sample words
    for (const word of sampleWords) {
      await store.addWord(word);
    }

    // Reload battles
    await store.loadBattles();
  } catch (error) {
    console.error("Error adding sample battle:", error);
  } finally {
    loading.value = false;
  }
};

// Initialize data on component mount
onMounted(async () => {
  if (!store.words.length) await Promise.all([store.loadWords(), store.loadBattles()]);
});
</script>

<style scoped>
.p-button {
  @apply px-4 py-2 rounded-lg transition-all duration-200;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
