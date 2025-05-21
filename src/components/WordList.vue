<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Imported Words</h2>
      <Button
        @click="handleDeleteDuplicates"
        :loading="store.loading"
        severity="danger"
        class="p-button-sm"
      >
        Delete Duplicates
      </Button>
    </div>

    <!-- Battle Filter -->
    <div class="mb-4">
      <Select
        v-model="selectedBattle"
        :options="store.battleOptions"
        filter
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-56"
        @change="(event) => handleBattleChange(event.value)"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center">
            <div>{{ slotProps.value.name }}</div>
          </div>
          <span v-else>
            {{ slotProps.placeholder }}
          </span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
    </div>

    <div v-if="store.loading && !store.words.length" class="text-gray-500">
      Loading...
    </div>
    <div v-else-if="!filteredWords.length" class="text-center py-8">
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
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <!-- Word cards -->
      <WordCard
        v-for="(word, index) in filteredWords"
        :key="word.id || index"
        :word="word"
      />

      <!-- Load More Button - only show when no battle is selected -->
      <div class="flex justify-center mt-4">
        <Button
          @click="store.loadMore"
          :loading="store.loadingMore"
          class="p-button-outlined"
        >
          Load More
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
  store.selectBattle(battle);
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

    // Add the battle first
    const battle = {
      name: "Battle of Yarmouk",
    };

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
  @apply px-4 py-2 rounded-lg;
}
</style>
